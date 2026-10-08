import SnapKit

class NavigationBarViewController: BaseViewController {
    
    private var _leftBarBtn: UIButton?
    private var _rightBarBtn: UIButton?

    // --------------------------------------
    // MARK: Life Cycle
    // --------------------------------------

    override func viewDidLoad() {
        super.viewDidLoad()
        updateLeftBarButton(leftBarButton)
        updateRightBarButton(rightBarButton)
    }

    // --------------------------------------
    // MARK: Templates
    // --------------------------------------

    var leftBarButton: UIButton? {
        // Implement at subclass
        return nil
    }

    var rightBarButton: UIButton? {
        return nil
    }

    @objc func handleLeftBarButtonEvent() {
        // Implement at subclass
    }

    @objc func handleRightBarButtonEvent() {
        // Implement at subclass
    }

    // --------------------------------------
    // MARK: Public
    // --------------------------------------

    func updateLeftBarButton(_ button: UIButton?) {
        _leftBarBtn = button
        if _leftBarBtn != nil {
            _leftBarBtn!.addTarget(self, action: #selector(handleLeftBarButtonEvent), for: .touchUpInside)
            navigationItem.leftBarButtonItem = UIBarButtonItem(customView: _leftBarBtn!)
        }
    }

    func enableLeftBarButton(_ enabled: Bool) {
        _leftBarBtn?.isEnabled = enabled
    }

    func updateRightBarButton(_ button: UIButton?) {
        _rightBarBtn = button
        if _rightBarBtn != nil {
            _rightBarBtn!.addTarget(self, action: #selector(handleRightBarButtonEvent), for: .touchUpInside)
            navigationItem.rightBarButtonItem = UIBarButtonItem(customView: _rightBarBtn!)
        }
    }

    func enableRightBarButton(_ enabled: Bool) {
        _rightBarBtn?.isEnabled = enabled
    }

    func setTitle(title: String, subtitle: String) {
        let titleLabel = UILabel(frame: CGRect(x: 0, y: -2, width: 0, height: 0))

        titleLabel.backgroundColor = UIColor.clear
        titleLabel.textColor = ColorBrand.appColorWhite
        titleLabel.font = FontBrand.navBarTitleFont
        titleLabel.text = title
        titleLabel.sizeToFit()

        let subtitleLabel = UILabel(frame: CGRect(x: 0, y: 18, width: 0, height: 0))
        subtitleLabel.backgroundColor = UIColor.clear
        subtitleLabel.textColor = ColorBrand.appColorWhite
        subtitleLabel.font = FontBrand.segmentTitleFont
        subtitleLabel.text = subtitle
        subtitleLabel.sizeToFit()

        let titleView = UIView(frame: CGRect(x: 0, y: 0, width: max(titleLabel.frame.size.width, subtitleLabel.frame.size.width), height: 30))
        titleView.addSubview(titleLabel)
        titleView.addSubview(subtitleLabel)

        let widthDiff = subtitleLabel.frame.size.width - titleLabel.frame.size.width
        if widthDiff < 0 {
            let newX = widthDiff / 2
            subtitleLabel.frame.origin.x = abs(newX)
        } else {
            let newX = widthDiff / 2
            titleLabel.frame.origin.x = newX
        }

        navigationItem.titleView = titleView
    }
    
    func setLogoImage(_ image: UIImage?) {
        let imageView = UIImageView(image: image)
        imageView.snp.makeConstraints { make in
            make.height.equalTo(24)
        }
        imageView.contentMode = .scaleAspectFit
        imageView.tintColor = ColorBrand.appColorWhite
        self.navigationItem.titleView = imageView
    }
    
}
