import UIKit

extension UITextField {
	func addBottomBorder(color: UIColor?, height: CGFloat) {
		let bottomLine = CALayer()
		bottomLine.frame = CGRect(x: 0, y: frame.size.height - height, width: frame.size.width, height: height)
		bottomLine.backgroundColor = color?.cgColor
		borderStyle = .none
		layer.addSublayer(bottomLine)
	}
}
