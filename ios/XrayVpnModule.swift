import Foundation
import NetworkExtension


@objc(XrayVpnModule)
class XrayVpnModule: NSObject {
  
  // Указываем React Native, что этот модуль должен работать в основном потоке
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc(connect:resolver:rejecter:)
  func connect(vlessUrl: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    
    // Передаем нашу vless-ссылку в конфигурацию туннеля
    NETunnelProviderManager.loadAllFromPreferences { (managers, error) in
      if let error = error {
        reject("loading_failed", "Failed to load preferences", error)
        return
      }
      
      let manager = managers?.first ?? NETunnelProviderManager()
      
      // Настраиваем протокол и передаем конфиг
      let protocolConfiguration = NETunnelProviderProtocol()
      protocolConfiguration.providerBundleIdentifier = "com.didar.vpntest.XrayTunnel"
      // Сервисный адрес: реальный endpoint берется и парсится из xrayConfig в extension.
      protocolConfiguration.serverAddress = "xray-vless"
      
      // Передаем JSON/строку с конфигом в туннель
      protocolConfiguration.providerConfiguration = ["vlessConfig": vlessUrl]
      
      manager.protocolConfiguration = protocolConfiguration
      manager.localizedDescription = "Xray VLESS Connection"
      manager.isEnabled = true
      
      manager.saveToPreferences { error in
              if let error = error {
                reject("save_failed", "Failed to save preferences", error)
                return
              }
              
              // ВАЖНО: Хак для iOS. Нужно заново загрузить профиль перед первым запуском
              manager.loadFromPreferences { error in
                  do {
                      try manager.connection.startVPNTunnel()
                      resolve("Connected successfully")
                  } catch let startError {
                      // Если iOS всё равно тупит, даем ей полсекунды форы
                      DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                          do {
                              try manager.connection.startVPNTunnel()
                              resolve("Connected successfully")
                          } catch {
                              reject("start_failed", "Failed to start tunnel after delay: \(error)", nil)
                          }
                      }
                  }
              }
            }
      }
    }
  
  
  @objc(disconnect:rejecter:)
  func disconnect(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    NETunnelProviderManager.loadAllFromPreferences { (managers, error) in
      if let error = error {
        reject("loading_failed", "Failed to load preferences", error)
        return
      }
      if let manager = managers?.first {
        manager.connection.stopVPNTunnel()
        resolve("Disconnected successfully")
      } else {
        resolve("No active tunnel found")
      }
    }
  }
}
