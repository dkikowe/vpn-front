#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(XrayVpnModule, NSObject)

RCT_EXTERN_METHOD(connect:(NSString *)vlessUrl
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(disconnect:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
