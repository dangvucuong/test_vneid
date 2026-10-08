import SnapKit

class RefreshView: UIView {
    private var _activity: UIActivityIndicatorView!

    // --------------------------------------
    // MARK: Life Cycle
    // --------------------------------------

    override init(frame: CGRect) {
        super.init(frame: frame)
        _customInit()
    }

    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        _customInit()
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        _activity.snp.makeConstraints { make in
            make.width.equalTo(30)
            make.height.equalTo(30)
            make.centerX.equalTo(self)
            make.centerY.equalTo(self)
        }
    }

    // --------------------------------------
    // MARK: Private
    // --------------------------------------

    private func _customInit() {
        _activity = UIActivityIndicatorView()
        _activity.color = ColorBrand.appColorDarkGray
        autoresizingMask = [.flexibleWidth, .flexibleHeight]
        autoresizesSubviews = true
        addSubview(_activity)
    }

    // --------------------------------------
    // MARK: Public
    // --------------------------------------

    func showActivity() {
        _activity.startAnimating()
    }

    func hideActivity() {
        _activity.stopAnimating()
    }
}
