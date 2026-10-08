import UIKit

enum DropShadowType {
	case rect, circle, dynamic
}

extension UIView {
	func dropShadow(opacity: CGFloat, radius: CGFloat, offset: CGSize) {
		dropShadow(color: UIColor.black, opacity: opacity, radius: radius, offset: offset)
	}

	func dropShadow(color: UIColor?, opacity: CGFloat, radius: CGFloat, offset: CGSize) {
		layer.masksToBounds = false
		layer.rasterizationScale = UIScreen.main.scale
		layer.shouldRasterize = true
		layer.shadowColor = color?.cgColor
		layer.shadowOffset = offset
		layer.shadowRadius = radius
		layer.shadowOpacity = Float(opacity)

		let shadowRect: CGRect = bounds.insetBy(dx: 0, dy: 0)
		layer.shadowPath = UIBezierPath(rect: shadowRect).cgPath
	}

	func rotate(_ toValue: CGFloat, duration: CFTimeInterval = 0.2) {
		let animation = CABasicAnimation(keyPath: "transform.rotation")
		animation.toValue = toValue
		animation.duration = duration
		animation.isRemovedOnCompletion = false
		animation.fillMode = CAMediaTimingFillMode.forwards
		layer.add(animation, forKey: nil)
	}

	func borders(for edges: [UIRectEdge], width: CGFloat = 1, color: UIColor = .black) {
		if edges.contains(.all) {
			layer.borderWidth = width
			layer.borderColor = color.cgColor
		} else {
			let allSpecificBorders: [UIRectEdge] = [.top, .bottom, .left, .right]

			for edge in allSpecificBorders {
				if let view = viewWithTag(Int(edge.rawValue)) {
					view.removeFromSuperview()
				}

				if edges.contains(edge) {
					let view = UIView()
					view.tag = Int(edge.rawValue)
					view.backgroundColor = color
					view.translatesAutoresizingMaskIntoConstraints = false
					addSubview(view)

					var horizontalVisualFormat = "H:"
					var verticalVisualFormat = "V:"

					switch edge {
						case UIRectEdge.bottom:
							horizontalVisualFormat += "|-(0)-[v]-(0)-|"
							verticalVisualFormat += "[v(\(width))]-(0)-|"
						case UIRectEdge.top:
							horizontalVisualFormat += "|-(0)-[v]-(0)-|"
							verticalVisualFormat += "|-(0)-[v(\(width))]"
						case UIRectEdge.left:
							horizontalVisualFormat += "|-(0)-[v(\(width))]"
							verticalVisualFormat += "|-(0)-[v]-(0)-|"
						case UIRectEdge.right:
							horizontalVisualFormat += "[v(\(width))]-(0)-|"
							verticalVisualFormat += "|-(0)-[v]-(0)-|"
						default:
							break
					}

					addConstraints(NSLayoutConstraint.constraints(
						withVisualFormat: horizontalVisualFormat,
						options: .directionLeadingToTrailing,
						metrics: nil,
						views: ["v": view]))
					addConstraints(NSLayoutConstraint.constraints(
						withVisualFormat: verticalVisualFormat,
						options: .directionLeadingToTrailing,
						metrics: nil,
						views: ["v": view]))
				}
			}
		}
	}

	func fadeIn(
		_ duration: TimeInterval = 1.0,
		delay: TimeInterval = 0.0,
		completion: @escaping ((Bool) -> Void) = { (_: Bool) -> Void in }) {
		UIView.animate(withDuration: duration, delay: delay, options: UIView.AnimationOptions.curveEaseIn, animations: {
			self.alpha = 1.0
		}, completion: completion)
	}

	func fadeOut(
		_ duration: TimeInterval = 1.0,
		delay: TimeInterval = 0.0,
		completion: @escaping (Bool) -> Void = { (_: Bool) -> Void in }) {
		UIView.animate(withDuration: duration, delay: delay, options: UIView.AnimationOptions.curveEaseIn, animations: {
			self.alpha = 0.0
		}, completion: completion)
	}

	func addDropShadow(type: DropShadowType = .dynamic, color: UIColor = UIColor.black, opacity: Float = 0.3, radius: CGFloat = 4.0, shadowOffset: CGSize = CGSize.zero) {
		layer.shadowOpacity = opacity
		layer.shadowRadius = radius
		layer.shadowOffset = shadowOffset
		layer.shadowColor = color.cgColor

		switch type {
			case .circle:
				let halfWidth = frame.size.width * 0.5
				layer.shadowPath = UIBezierPath(arcCenter: CGPoint(x: halfWidth, y: halfWidth), radius: halfWidth, startAngle: 0.0, endAngle: CGFloat.pi * 2, clockwise: true).cgPath
				layer.shouldRasterize = true
				layer.rasterizationScale = UIScreen.main.scale
			case .rect:
				layer.shadowPath = UIBezierPath(roundedRect: frame, cornerRadius: layer.cornerRadius).cgPath
				layer.shouldRasterize = true
			case .dynamic:
				layer.shouldRasterize = true
				layer.rasterizationScale = UIScreen.main.scale
		}
	}

	func takeSnapshot() -> UIImage? {
		UIGraphicsBeginImageContext(CGSize(width: frame.size.width, height: frame.size.height - 5))
		let rect = CGRect(x: 0.0, y: 0.0, width: frame.size.width, height: frame.size.height)
		drawHierarchy(in: rect, afterScreenUpdates: true)
		let image = UIGraphicsGetImageFromCurrentImageContext()
		UIGraphicsEndImageContext()
		return image
	}

	func roundCorners(corners: UIRectCorner, radius: CGFloat) {
		let path = UIBezierPath(roundedRect: bounds, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
		let mask = CAShapeLayer()
		mask.path = path.cgPath
		layer.mask = mask
	}
}
