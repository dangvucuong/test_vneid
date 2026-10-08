import iProgressHUD
import UIKit

class CustomActivityButton: CustomButton {
    
    var isLoading: Bool = false

    private var _titleText: String = ""
    private var _activity: NVActivityIndicatorView!

    // --------------------------------------
    // MARK: Overrides
    // --------------------------------------

    override func customize() {
        super.customize()
        _activity = NVActivityIndicatorView(frame: CGRect(x: 0, y: 0, width: 32, height: 32))
        _activity.color = ColorBrand.appColorWhite
        _activity.type = .ballPulse
        addSubview(_activity)
    }

    override func draw(_ rect: CGRect) {
        super.draw(rect)
        _activity.center = CGPoint(x: frame.width / 2, y: frame.height / 2)
    }

    // --------------------------------------
    // MARK: Public
    // --------------------------------------

    func showActivity() {
        setTitle("", for: .normal)
        setTitle("", for: .highlighted)
        setTitle("", for: .selected)
        isEnabled = false
        isLoading = true
        _titleText = titleLabel?.text ?? ""
        _activity.startAnimating()
    }

    func hideActivity() {
        setTitle(_titleText, for: .normal)
        setTitle(_titleText, for: .highlighted)
        setTitle(_titleText, for: .selected)
        isEnabled = true
        isLoading = false
        _titleText = titleLabel?.text ?? ""
        _activity.stopAnimating()
    }
}
