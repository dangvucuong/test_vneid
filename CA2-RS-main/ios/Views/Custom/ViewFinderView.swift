
import UIKit

@IBDesignable
public class ViewFinderView: UIView, NibLoadable {

	@IBOutlet private var _corners: [UIImageView]! {
		didSet {
			for corner in _corners {
				corner.tintColor = ColorBrand.appColorWhite
			}
		}
	}
	@IBOutlet private weak var _flipView: UIView! {
		didSet {
			_flipView.alpha = Animation.Viewfinder.flipViewAlphaBegin
			_flipView.isHidden = true
			_flipView.backgroundColor = ColorBrand.appColorBlueSky
		}
	}
	@IBOutlet private weak var _flipImage: UIImageView! {
		didSet { _flipImage.tintColor = ColorBrand.appColorWhite }
	}

    public struct Animation {
		struct OverlayViewController {
			static let viewfinderChangeAnimationTime: Double = 0.2
			static let documentSelectionAnimationTime: Double = 0.75
			static let messageLabelAnimationDelayTime: Double = 2.0
			static let messageLabelAnimationTime: Double = 0.25
			static var messageLabelAlphaBegin: CGFloat = 1.0
			static var messageLabelAlphaEnd: CGFloat = 0.0
		}

		struct Viewfinder {
			static var flipViewAlphaBegin: CGFloat = 0.0
			static var flipViewAlphaEnd: CGFloat = 0.8
			static let showFlipViewAnimationTime: Double = 0.3
			static let flipViewAnimationTime: Double = 1.0
		}

		struct DocumentTabsView {
			static let scrollToTabAnimationTime: Double = 0.2
		}

		struct ScanLine {
			static let speed: CGFloat = 175
		}
	}

	// --------------------------------------
	// MARK: Life Cycle
	// --------------------------------------

	required public init?(coder aDecoder: NSCoder) {
		super.init(coder: aDecoder)
		setupFromNib()
	}

	override public init(frame: CGRect) {
		super.init(frame: frame)
		setupFromNib()
	}

	override public func awakeFromNib() {
		super.awakeFromNib()
	}

	// --------------------------------------
	// MARK: Private
	// --------------------------------------

	private func _animateFlipViewShow() {
		_flipView.isHidden = false
		_flipView.alpha = Animation.Viewfinder.flipViewAlphaBegin
		UIView.animate(withDuration: Animation.Viewfinder.showFlipViewAnimationTime, delay: 0.0, options: .curveEaseOut, animations: {
			self._flipView.alpha = Animation.Viewfinder.flipViewAlphaEnd
		}, completion: { _ in
			self._animateFlip()
		})
	}

	private func _animateFlip() {
		UIView.transition(with: _flipView, duration: Animation.Viewfinder.flipViewAnimationTime, options: .transitionFlipFromLeft, animations: nil) { _ in
			self._animateFlipViewHide()
		}
	}

	private func _animateFlipViewHide() {
		_flipView.alpha = Animation.Viewfinder.flipViewAlphaEnd
		UIView.animate(withDuration: Animation.Viewfinder.showFlipViewAnimationTime, delay: 0.0, options: .curveEaseOut, animations: {
			self._flipView.alpha = Animation.Viewfinder.flipViewAlphaBegin
		}, completion: { _ in
			self._flipView.isHidden = true
		})

	}

	// --------------------------------------
	// MARK: Public
	// --------------------------------------

    public func startScanLineAnimation() {

		let height: CGFloat = 3.0
		let layer = CALayer()
		layer.backgroundColor = ColorBrand.appColorRed.cgColor
		layer.frame = CGRect(x: _flipView.frame.origin.x, y: _flipView.frame.origin.y, width: _flipView.frame.width, height: height)
		self.layer.insertSublayer(layer, at: 0)

		let initialYPosition = layer.position.y
		let finalYPosition = initialYPosition + _flipView.frame.height - height
		let duration: CFTimeInterval = 1.0

		let animation = CABasicAnimation(keyPath: "position.y")
		animation.fromValue = initialYPosition as NSNumber
		animation.toValue = finalYPosition as NSNumber
		animation.duration = duration
		animation.repeatCount = .infinity
		animation.autoreverses = true
		animation.isRemovedOnCompletion = false

		layer.add(animation, forKey: nil)
	}

    public func startFlipAnimation() {
		_animateFlipViewShow()
	}
}
