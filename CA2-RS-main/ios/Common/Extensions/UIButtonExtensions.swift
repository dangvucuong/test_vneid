import UIKit

extension UIButton {
	func dropShadow() {
		Graphics.dropShadow(self, opacity: 0.5, radius: 1.0, offset: CGSize.zero)
	}

	func setRoundCorner(_ cornerRadius: CGFloat) {
		layer.cornerRadius = cornerRadius
		clipsToBounds = true
	}

	func setBorder(_ borderWidth: CGFloat) {
		layer.borderWidth = borderWidth
		layer.borderColor = backgroundColor?.darkerColor().cgColor
	}
}
