#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(EIDModule, NSObject)

RCT_EXTERN_METHOD(StartEKYC: (NSString *)name successCallback:(RCTResponseSenderBlock *)successCallback errorCallback:(RCTResponseSenderBlock *)errorCallback)
+ (BOOL)requiresMainQueueSetup
{
  return NO;
}
@end
