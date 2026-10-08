import QuartzCore
import UIKit

extension UIImage {
	func tintImage(with tintColor: UIColor?) -> UIImage? {
		UIGraphicsBeginImageContextWithOptions(size, _: false, _: UIScreen.main.scale)
		let context = UIGraphicsGetCurrentContext()!

		context.translateBy(x: 0, y: size.height)
		context.scaleBy(x: 1.0, y: -1.0)

		let rect = CGRect(x: 0, y: 0, width: size.width, height: size.height)

		context.setBlendMode(CGBlendMode.normal)
		context.draw(cgImage!, in: rect)

		context.setBlendMode(CGBlendMode.sourceIn)
		tintColor?.setFill()
		context.fill(rect)

		let coloredImage = UIGraphicsGetImageFromCurrentImageContext()
		UIGraphicsEndImageContext()
		return coloredImage
	}

	func rotate(radians: Float) -> UIImage? {
		var newSize = CGRect(origin: CGPoint.zero, size: size).applying(CGAffineTransform(rotationAngle: CGFloat(radians))).size
		newSize.width = floor(newSize.width)
		newSize.height = floor(newSize.height)
		UIGraphicsBeginImageContextWithOptions(newSize, false, scale)
		let context = UIGraphicsGetCurrentContext()!
		context.translateBy(x: newSize.width / 2, y: newSize.height / 2)
		context.rotate(by: CGFloat(radians))
		draw(in: CGRect(x: -size.width / 2, y: -size.height / 2, width: size.width, height: size.height))
		let newImage = UIGraphicsGetImageFromCurrentImageContext()
		UIGraphicsEndImageContext()
		return newImage
	}

	func imageWithInsets(insets: UIEdgeInsets) -> UIImage? {
		UIGraphicsBeginImageContextWithOptions(
			CGSize(
				width: size.width + insets.left + insets.right,
				height: size.height + insets.top + insets.bottom), false, scale)
		_ = UIGraphicsGetCurrentContext()
		let origin = CGPoint(x: insets.left, y: insets.top)
		draw(at: origin)
		let imageWithInsets = UIGraphicsGetImageFromCurrentImageContext()
		UIGraphicsEndImageContext()
		return imageWithInsets
	}

	public func withRoundedCorners() -> UIImage? {
		let imageLayer = CALayer()
		let size = min(self.size.width, self.size.height)
		let cropRect = CGRect(
			x: (self.size.width - size) / 2,
			y: (self.size.height - size) / 2,
			width: (self.size.width + size) / 2,
			height: (self.size.height + size) / 2)

		let cutImageRef: CGImage = (cgImage?.cropping(to: cropRect)!)!
		imageLayer.frame = CGRect(x: 0, y: 0, width: size, height: size)
		imageLayer.contents = cutImageRef

		imageLayer.masksToBounds = true
		imageLayer.cornerRadius = size / 2

		UIGraphicsBeginImageContext(CGSize(width: size, height: size))
		imageLayer.render(in: UIGraphicsGetCurrentContext()!)

		let roundedImage = UIGraphicsGetImageFromCurrentImageContext()
		UIGraphicsEndImageContext()

		return roundedImage!
	}

	func saveToPhotoLibrary(_ completionTarget: Any?, _ completionSelector: Selector?) {
		DispatchQueue.global(qos: .userInitiated).async {
			UIImageWriteToSavedPhotosAlbum(self, completionTarget, completionSelector, nil)
		}
	}
}
