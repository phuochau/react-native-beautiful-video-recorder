
#import "RNMov2mp4.h"
#import <AVFoundation/AVFoundation.h>
#import <AVFoundation/AVAsset.h>

@implementation RNMov2mp4

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}
RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(convert:(NSString *)movPath resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    @try {
        movPath = [movPath stringByReplacingOccurrencesOfString:@"file://"
                                                       withString:@""];
        AVURLAsset *avAsset = [AVURLAsset URLAssetWithURL:[NSURL fileURLWithPath:movPath] options:nil];
        NSArray *compatiblePresets = [AVAssetExportSession exportPresetsCompatibleWithAsset:avAsset];
        
        if ([compatiblePresets containsObject:AVAssetExportPresetLowQuality])
        {
            AVAssetExportSession *exportSession = [[AVAssetExportSession alloc]initWithAsset:avAsset presetName:AVAssetExportPresetPassthrough];
            // save to temp directory
            NSString* tempDirectory = [NSSearchPathForDirectoriesInDomains(NSCachesDirectory,
                                                                           NSUserDomainMask,
                                                                           YES) lastObject];
            NSString *videoPath = [tempDirectory stringByAppendingPathComponent: [NSString stringWithFormat:@"%@.mp4", [[NSProcessInfo processInfo] globallyUniqueString]]];
            
            exportSession.outputURL = [NSURL fileURLWithPath:videoPath];
            NSLog(@"videopath of your mp4 file = %@",videoPath);  // PATH OF YOUR .mp4 FILE
            exportSession.outputFileType = AVFileTypeMPEG4;
            
            [exportSession exportAsynchronouslyWithCompletionHandler:^{
                
                switch ([exportSession status]) {
                        
                    case AVAssetExportSessionStatusFailed:
                        reject([[exportSession error] localizedDescription], nil, nil);
                        break;
                        
                    case AVAssetExportSessionStatusCancelled:
                        reject(@"Canceled", nil, nil);
                        break;
                        
                    case AVAssetExportSessionStatusCompleted:
                        resolve(@{ @"path": videoPath });
                        break;
                        
                    default:
                        break;
                }
            }];
            
        }
    } @catch(NSException *e) {
        reject(e.reason, nil, nil);
    }
}

@end
  
