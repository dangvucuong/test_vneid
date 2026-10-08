import UIKit

extension UIImageView {
	func circleImage(_ image: UIImage?, borderWidth: CGFloat = 0, borderColor: UIColor? = nil) {
		self.image = image
		layer.cornerRadius = frame.width / 2.0
		layer.borderWidth = borderWidth
		layer.borderColor = borderColor?.cgColor
	}

	func setImageColor(color: UIColor) {
		let templateImage = image?.withRenderingMode(.alwaysTemplate)
		image = templateImage
		tintColor = color
	}
}
