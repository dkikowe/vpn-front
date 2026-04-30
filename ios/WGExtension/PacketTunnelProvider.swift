import NetworkExtension
import WireGuardKit
import Network
import os.log

@objc(PacketTunnelProvider)
public class PacketTunnelProvider: NEPacketTunnelProvider {
    
    private lazy var adapter: WireGuardAdapter = {
        return WireGuardAdapter(with: self) { logLevel, message in
            os_log("AmneziaWG Log: %{public}@", log: OSLog.default, type: .debug, message)
        }
    }()
  public override func startTunnel(options: [String : NSObject]?, completionHandler: @escaping (Error?) -> Void) {
      
      guard let protocolConfiguration = protocolConfiguration as? NETunnelProviderProtocol,
            let providerConfig = protocolConfiguration.providerConfiguration else {
          completionHandler(NSError(domain: "VPN", code: 1, userInfo: [NSLocalizedDescriptionKey: "Missing config"]))
          return
      }
      
      // Чистим входные данные
      let privateKeyStr = (providerConfig["privateKey"] as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
      let publicKeyStr = (providerConfig["publicKey"] as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
      let serverAddressStr = (providerConfig["serverAddress"] as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
      let serverPortStr = (providerConfig["serverPort"] as? String ?? "51820").trimmingCharacters(in: .whitespacesAndNewlines)
      let addressStr = (providerConfig["address"] as? String ?? "10.8.0.2/32").trimmingCharacters(in: .whitespacesAndNewlines)
      let dnsStr = (providerConfig["dns"] as? [String])?.first ?? "8.8.8.8"
      
      do {
          guard let privateKey = PrivateKey(base64Key: privateKeyStr),
                let publicKey = PublicKey(base64Key: publicKeyStr) else {
              throw NSError(domain: "VPN", code: 2, userInfo: [NSLocalizedDescriptionKey: "Invalid Keys"])
          }
          
          var interface = InterfaceConfiguration(privateKey: privateKey)
          
          // 1. ИСПРАВЛЕННЫЙ ПАРСИНГ АДРЕСОВ (разбиваем список через запятую)
          let addressComponents = addressStr.components(separatedBy: ",")
          interface.addresses = addressComponents.compactMap { IPAddressRange(from: $0.trimmingCharacters(in: .whitespaces)) }
          
          // 2. ПАРАМЕТРЫ АМНЕЗИИ (Числовые значения)
          interface.junkPacketCount = UInt16(providerConfig["jc"] as? String ?? "120")
          interface.junkPacketMinSize = UInt16(providerConfig["jmin"] as? String ?? "50")
          interface.junkPacketMaxSize = UInt16(providerConfig["jmax"] as? String ?? "1000")
          interface.initPacketJunkSize = UInt16(providerConfig["s1"] as? String ?? "113")
          interface.responsePacketJunkSize = UInt16(providerConfig["s2"] as? String ?? "120")
          
          // 3. МАГИЧЕСКИЕ ЗАГОЛОВКИ (Тип String — исправлено!)
          interface.initPacketMagicHeader = providerConfig["h1"] as? String ?? "1"
          interface.responsePacketMagicHeader = providerConfig["h2"] as? String ?? "2"
          interface.underloadPacketMagicHeader = providerConfig["h3"] as? String ?? "3"
          interface.transportPacketMagicHeader = providerConfig["h4"] as? String ?? "4"
          
          interface.mtu = 1280
          
          if let dnsIp = IPv4Address(dnsStr) {
              interface.dns = [DNSServer(address: dnsIp)]
          }
          
          var peer = PeerConfiguration(publicKey: publicKey)
          let host = NWEndpoint.Host(serverAddressStr)
          guard let port = NWEndpoint.Port(serverPortStr) else { throw NSError(domain: "VPN", code: 4, userInfo: [NSLocalizedDescriptionKey: "Invalid Port"]) }
          
          peer.endpoint = Endpoint(host: host, port: port)
          peer.persistentKeepAlive = 25
          
          // AllowedIPs тоже через запятую
          let allowedIPsStr = (providerConfig["allowedIPs"] as? [String])?.joined(separator: ", ") ?? "0.0.0.0/0, ::/0"
          peer.allowedIPs = allowedIPsStr.components(separatedBy: ",").compactMap { IPAddressRange(from: $0.trimmingCharacters(in: .whitespaces)) }
          
          let tunnelConfig = TunnelConfiguration(name: "Amnezia", interface: interface, peers: [peer])
          
          // 4. НАСТРОЙКИ СЕТИ (Добавляем IPv4 и IPv6)
          let networkSettings = NEPacketTunnelNetworkSettings(tunnelRemoteAddress: serverAddressStr)
          
          let ipv4Addresses = addressComponents.filter { !$0.contains(":") }.map { $0.components(separatedBy: "/").first ?? $0 }
          let ipv4Settings = NEIPv4Settings(addresses: ipv4Addresses, subnetMasks: ipv4Addresses.map { _ in "255.255.255.255" })
          ipv4Settings.includedRoutes = [NEIPv4Route.default()]
          networkSettings.ipv4Settings = ipv4Settings
          
          let ipv6Addresses = addressComponents.filter { $0.contains(":") }.map { $0.components(separatedBy: "/").first ?? $0 }
          if !ipv6Addresses.isEmpty {
              let ipv6Settings = NEIPv6Settings(addresses: ipv6Addresses, networkPrefixLengths: ipv6Addresses.map { _ in 128 })
              ipv6Settings.includedRoutes = [NEIPv6Route.default()]
              networkSettings.ipv6Settings = ipv6Settings
          }
          
          networkSettings.dnsSettings = NEDNSSettings(servers: [dnsStr])
          
          setTunnelNetworkSettings(networkSettings) { error in
              if let error = error {
                  completionHandler(error)
                  return
              }
              self.adapter.start(tunnelConfiguration: tunnelConfig) { adapterError in
                  completionHandler(adapterError)
              }
          }
      } catch {
          os_log("VPN FATAL ERROR: %{public}@", log: OSLog.default, type: .error, error.localizedDescription)
          completionHandler(error)
      }
  }
            
            
    public override func stopTunnel(with reason: NEProviderStopReason, completionHandler: @escaping () -> Void) {
        adapter.stop { _ in completionHandler() }
    }
}
