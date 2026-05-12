import Foundation
import NetworkExtension
import LibXray

class PacketTunnelProvider: NEPacketTunnelProvider {
    
    override func startTunnel(options: [String : NSObject]?, completionHandler: @escaping (Error?) -> Void) {
        
        setenv("GOMEMLIMIT", "30MiB", 1)
        setenv("GOGC", "10", 1)
        
        // 1. ОБХОД ПЕСОЧНИЦЫ iOS
        if let docDir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?.path {
            FileManager.default.changeCurrentDirectoryPath(docDir)
            setenv("xray.location.asset", docDir, 1)
        }
        
        guard let conf = (protocolConfiguration as? NETunnelProviderProtocol)?.providerConfiguration,
              let xrayJson = conf["vlessConfig"] as? String else {
            completionHandler(NSError(domain: "Xray", code: 0, userInfo: [NSLocalizedDescriptionKey: "Empty Config"]))
            return
        }
        
        // 2. НАСТРОЙКИ СЕТИ И МАРШРУТОВ
        let serverIP = "89.125.243.49"
        let networkSettings = NEPacketTunnelNetworkSettings(tunnelRemoteAddress: serverIP)
        
        networkSettings.ipv4Settings = NEIPv4Settings(addresses: ["198.18.0.2"], subnetMasks: ["255.255.255.255"])
        networkSettings.ipv4Settings?.includedRoutes = [NEIPv4Route.default()]
        networkSettings.ipv4Settings?.excludedRoutes = [
            NEIPv4Route(destinationAddress: serverIP, subnetMask: "255.255.255.255")
        ]
        
        let dnsSettings = NEDNSSettings(servers: ["1.1.1.1", "8.8.8.8"])
        dnsSettings.matchDomains = [""]
        networkSettings.dnsSettings = dnsSettings
        networkSettings.mtu = 1350
        
        setTunnelNetworkSettings(networkSettings) { error in
            if let error = error {
                completionHandler(error)
                return
            }
            
            // 🟢 3. ДОСТАЕМ DESCRIPTOR И ПЕРЕДАЕМ НАПРЯМУЮ В XRAY
            if let tunFD = self.packetFlow.value(forKeyPath: "socket.fileDescriptor") as? Int32 {
                LibXraySetTunFd(tunFD) // Отдаем трубу прямо в ядро!
            } else {
                print("ОШИБКА: Не удалось получить FD")
            }
            
            // 4. ЗАПУСКАЕМ ЯДРО
            DispatchQueue.global(qos: .userInitiated).async {
                LibXrayRunXray(xrayJson)
            }
            
            completionHandler(nil)
        }
    }
    
    override func stopTunnel(with reason: NEProviderStopReason, completionHandler: @escaping () -> Void) {
        LibXrayStopXray()
        completionHandler()
    }
}
