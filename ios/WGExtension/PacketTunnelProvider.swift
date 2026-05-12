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
      
        // 1. ИСПРАВЛЕННЫЙ ПАРСИНГ ЭНДПОИНТА (Адрес и Порт)
        let endpointStr = (providerConfig["endpoint"] as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let endpointParts = endpointStr.split(separator: ":")
        let serverAddressStr = providerConfig["serverAddress"] as? String ?? (endpointParts.first.map(String.init) ?? "")
        let serverPortStr = providerConfig["serverPort"] as? String ?? (endpointParts.count > 1 ? String(endpointParts[1]) : "51820")
        
        let privateKeyStr = (providerConfig["privateKey"] as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let publicKeyStr = (providerConfig["publicKey"] as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let addressStr = (providerConfig["address"] as? String ?? "10.8.0.2/32").trimmingCharacters(in: .whitespacesAndNewlines)
        let dnsStr = (providerConfig["dns"] as? [String])?.first ?? "8.8.8.8"
      
        do {
            guard let privateKey = PrivateKey(base64Key: privateKeyStr),
                  let publicKey = PublicKey(base64Key: publicKeyStr) else {
                throw NSError(domain: "VPN", code: 2, userInfo: [NSLocalizedDescriptionKey: "Invalid Keys"])
            }
          
            var interface = InterfaceConfiguration(privateKey: privateKey)
          
            let addressComponents = addressStr.components(separatedBy: ",")
            interface.addresses = addressComponents.compactMap { IPAddressRange(from: $0.trimmingCharacters(in: .whitespaces)) }
          
            // 2. ЖЕЛЕЗОБЕТОННЫЙ ПАРСИНГ ПАРАМЕТРОВ АМНЕЗИИ (избегаем ошибок типов)
            interface.junkPacketCount = (providerConfig["jc"] as? NSNumber)?.uint16Value ?? UInt16(providerConfig["jc"] as? String ?? "") ?? 120
            interface.junkPacketMinSize = (providerConfig["jmin"] as? NSNumber)?.uint16Value ?? UInt16(providerConfig["jmin"] as? String ?? "") ?? 50
            interface.junkPacketMaxSize = (providerConfig["jmax"] as? NSNumber)?.uint16Value ?? UInt16(providerConfig["jmax"] as? String ?? "") ?? 1000
            interface.initPacketJunkSize = (providerConfig["s1"] as? NSNumber)?.uint16Value ?? UInt16(providerConfig["s1"] as? String ?? "") ?? 113
            interface.responsePacketJunkSize = (providerConfig["s2"] as? NSNumber)?.uint16Value ?? UInt16(providerConfig["s2"] as? String ?? "") ?? 120
 
            // 3. МАГИЧЕСКИЕ ЗАГОЛОВКИ (считываем как из строк, так и из чисел)
            interface.initPacketMagicHeader = (providerConfig["h1"] as? NSNumber)?.stringValue ?? providerConfig["h1"] as? String ?? "1"
            interface.responsePacketMagicHeader = (providerConfig["h2"] as? NSNumber)?.stringValue ?? providerConfig["h2"] as? String ?? "2"
            interface.underloadPacketMagicHeader = (providerConfig["h3"] as? NSNumber)?.stringValue ?? providerConfig["h3"] as? String ?? "3"
            interface.transportPacketMagicHeader = (providerConfig["h4"] as? NSNumber)?.stringValue ?? providerConfig["h4"] as? String ?? "4"
          
            interface.mtu = 1280
          
            if let dnsIp = IPv4Address(dnsStr) {
                interface.dns = [DNSServer(address: dnsIp)]
            }
          
            var peer = PeerConfiguration(publicKey: publicKey)
            let host = NWEndpoint.Host(serverAddressStr)
            guard let port = NWEndpoint.Port(serverPortStr) else {
                throw NSError(domain: "VPN", code: 4, userInfo: [NSLocalizedDescriptionKey: "Invalid Port"])
            }
          
            peer.endpoint = Endpoint(host: host, port: port)
            peer.persistentKeepAlive = 25
          
            let allowedIPsStr = (providerConfig["allowedIPs"] as? [String])?.joined(separator: ", ") ?? "0.0.0.0/0, ::/0"
            let allowedIPEntries = allowedIPsStr
                .components(separatedBy: ",")
                .map { $0.trimmingCharacters(in: .whitespaces) }
                .filter { !$0.isEmpty }
            peer.allowedIPs = allowedIPEntries.compactMap { IPAddressRange(from: $0) }
            let hasIPv6AllowedIPs = allowedIPEntries.contains { $0.contains(":") }
          
            let tunnelConfig = TunnelConfiguration(name: "Amnezia", interface: interface, peers: [peer])
          
            // 4. НАСТРОЙКИ СЕТИ
            let networkSettings = NEPacketTunnelNetworkSettings(tunnelRemoteAddress: serverAddressStr)
          
            let ipv4Addresses = addressComponents.filter { !$0.contains(":") }.map { $0.components(separatedBy: "/").first ?? $0 }
            let ipv4Settings = NEIPv4Settings(addresses: ipv4Addresses, subnetMasks: ipv4Addresses.map { _ in "255.255.255.255" })
            ipv4Settings.includedRoutes = [NEIPv4Route.default()]
            networkSettings.ipv4Settings = ipv4Settings
          
            let ipv6Addresses = addressComponents.filter { $0.contains(":") }.map { $0.components(separatedBy: "/").first ?? $0 }
            if hasIPv6AllowedIPs && !ipv6Addresses.isEmpty {
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
