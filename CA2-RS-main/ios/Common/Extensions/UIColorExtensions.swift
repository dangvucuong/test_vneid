import UIKit

extension UIColor {
	func lighterColor() -> UIColor {
		var red: CGFloat = 0
		var green: CGFloat = 0
		var blue: CGFloat = 0
		var alpha: CGFloat = 0
		let success: Bool = getRed(&red, green: &green, blue: &blue, alpha: &alpha)
		if success {
			return UIColor(red: CGFloat(min(red + 0.1, 1.0)), green: CGFloat(min(green + 0.1, 1.0)), blue: CGFloat(min(blue + 0.1, 1.0)), alpha: alpha)
		} else {
			return self
		}
	}

	func darkerColor() -> UIColor {
		var red: CGFloat = 0
		var green: CGFloat = 0
		var blue: CGFloat = 0
		var alpha: CGFloat = 0
		let success: Bool = getRed(&red, green: &green, blue: &blue, alpha: &alpha)
		if success {
			return UIColor(red: CGFloat(max(red - 0.1, 0.0)), green: CGFloat(max(green - 0.1, 0.0)), blue: CGFloat(max(blue - 0.1, 0.0)), alpha: alpha)
		} else {
			return self
		}
	}
}
