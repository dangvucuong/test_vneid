import UIKit

class CustomButton: UIButton {

    private var _hasShadow: Bool!
    private var _hasBorder: Bool!

    // --------------------------------------
    // MARK: Life Cycle
    // --------------------------------------

    init(_ frame: CGRect) {
        super.init(frame: frame)
        customize()
    }

    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        customize()
    }

    // --------------------------------------
    // MARK: Public
    // --------------------------------------

    var hasShadow : Bool {
        get {
            return _hasShadow
        }
        set {
            dropShadow()
            _hasShadow = newValue
        }
    }

    var hasBorder : Bool {
        get {
            return _hasBorder
        } set {
            setBorder(0.5)
            _hasBorder = newValue
        }
    }

    func customize() {
        setRoundCorner(kCornerRadius)
    }

}
