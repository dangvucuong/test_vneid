//
//  Utils.swift
//  xverifydemoapp
//
//  Created by Minh Tri on 30/11/2023.
//

import UIKit

class Utils {
    
    static var sampleDeviceUUID = UUID().uuidString
    
    class func getDocumentsDirectory() -> NSString {
        let paths = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)
        let documentsDirectory = paths[0]
        return documentsDirectory as NSString
    }
    
    class func saveFileToLocal(_ image: UIImage, fileName: String, shouldCropImage: Bool = false) -> URL {
        let directoryPath =  try! FileManager().url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        var savedImage: UIImage = UIImage()
        if shouldCropImage {
            if let cropCGImage = cropImage(image) {
                let cropImage = UIImage(cgImage: cropCGImage, scale: image.imageRendererFormat.scale,
                                     orientation: image.imageOrientation)
                savedImage = resize(image: cropImage, 360,480) ?? UIImage()
            }
        } else {
            savedImage = image
        }
        let urlString: NSURL = directoryPath.appendingPathComponent(fileName) as NSURL
        print("Image path : \(urlString)")
        if !FileManager.default.fileExists(atPath: urlString.path!) {
            do {
                try savedImage.jpegData(compressionQuality: 1.0)!.write(to: urlString as URL)
                    print ("Image Added Successfully")
            } catch {
                    print ("Image Not added")
            }
        }
        return urlString as URL
    }
    
    private static func cropImage(_ sourceImage: UIImage) -> CGImage? {
        // Determines the x,y coordinate of a centered
        // sideLength by sideLength square
        let cropOffset = 45
        let xOffset = cropOffset
        let yOffset = cropOffset

        // The cropRect is the rect of the image to keep,
        // in this case centered
        let cropRect = CGRect(
            x: xOffset,
            y: yOffset,
            width: Int(sourceImage.size.width) - (cropOffset * 2),
            height: Int(sourceImage.size.height) - (cropOffset * 2)
        ).integral

        // Center crop the image
        guard let sourceCGImage = sourceImage.cgImage else { return nil }
        if let croppedCGImage = sourceCGImage.cropping(
            to: cropRect
        ) {
            return croppedCGImage
        }
        
        return nil
    }
    
    private static func resize(image: UIImage, _ width: CGFloat, _ height:CGFloat) -> UIImage? {
        let newSize = CGSize(width: width, height: height)
        let rect = CGRect(x: 0, y: 0, width: newSize.width, height: newSize.height)
        UIGraphicsBeginImageContextWithOptions(newSize, false, 1.0)
        image.draw(in: rect)
        let newImage = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        return newImage
     }
    
    class func removeFileFromLocal(fileUrl: URL) {
        if FileManager.default.fileExists(atPath: fileUrl.path) {
            do {
                try FileManager.default.removeItem(atPath: fileUrl.path)
            } catch {
                Log.debug("Could not delete file, probably read-only filesystem")
            }
        }
    }
}

// MARK: - Constants
enum Constant {
  static let videoDataOutputQueueLabel = "vn.jth.xverifydemoapp.VideoDataOutputQueue"
  static let sessionQueueLabel = "vn.jth.xverifydemoapp.SessionQueue"
}

