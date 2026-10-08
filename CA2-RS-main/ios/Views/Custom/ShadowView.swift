import UIKit

public class ShadowView: UIView {

    public var shadowColor = ColorBrand.appColorBlack.withAlphaComponent(0.7)
    public var scanningRect = CGRect.zero
    public var cornerRadius: CGFloat = 0.0

    // --------------------------------------
    // MARK: Life Cycle
    // --------------------------------------

    required public init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        isUserInteractionEnabled = false
    }

    override public func draw(_ rect: CGRect) {
        super.draw(rect)

        let context = UIGraphicsGetCurrentContext()
        context?.clear(rect)

        let clipPath = UIBezierPath(rect: bounds)
        let scanningPath = UIBezierPath(roundedRect: scanningRect, cornerRadius: cornerRadius)
        clipPath.append(scanningPath)

        clipPath.usesEvenOddFillRule = true
        clipPath.addClip()

        shadowColor.setFill()
        clipPath.fill()
    }
}
