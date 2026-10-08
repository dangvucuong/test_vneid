import UIKit

protocol CollapsibleTableViewHeaderDelegate: AnyObject {
    func toggleSection(_ header: CollapsibleTableViewHeader, section: Int)
}

class CollapsibleTableViewHeader: UITableViewHeaderFooterView {
    let titleLbl = UILabel()
    let rightTitleLbl = UILabel()
    let arrowImgView = UIImageView()
    let barView = UIView()
    weak var delegate: CollapsibleTableViewHeaderDelegate?
    var section: Int = 0

    private var _backgroundColor: UIColor?

    // --------------------------------------
    // MARK: Life Cycle
    // --------------------------------------

    init(reuseIdentifier: String?, collapsible: Bool, collapsed _: Bool, backgroundColor: UIColor = ColorBrand.tableViewHeaderBackgroundColor) {
        super.init(reuseIdentifier: reuseIdentifier)
        let marginGuide = contentView.layoutMarginsGuide

        _backgroundColor = backgroundColor
        contentView.backgroundColor = _backgroundColor

        if collapsible {
            contentView.addSubview(arrowImgView)
            arrowImgView.image = UIImage(named: "ic_action_chevrondown")
            arrowImgView.tintColor = ColorBrand.appColorWhite
            arrowImgView.translatesAutoresizingMaskIntoConstraints = false
            arrowImgView.widthAnchor.constraint(equalToConstant: 16).isActive = true
            arrowImgView.heightAnchor.constraint(equalToConstant: 16).isActive = true
            arrowImgView.centerYAnchor.constraint(equalTo: contentView.safeAreaLayoutGuide.centerYAnchor).isActive = true
            arrowImgView.trailingAnchor.constraint(equalTo: marginGuide.trailingAnchor).isActive = true
            addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(CollapsibleTableViewHeader._tapHeader(_:))))
            // self.setCollapsed(collapsed, duration: 0)
        }

        contentView.addSubview(titleLbl)
        titleLbl.textColor = ColorBrand.appColorWhite
        titleLbl.font = FontBrand.tableHeaderFooterFont
        titleLbl.backgroundColor = ColorBrand.tableViewSectionIndexBackgroundColor
        titleLbl.translatesAutoresizingMaskIntoConstraints = false
        titleLbl.topAnchor.constraint(equalTo: marginGuide.topAnchor).isActive = true
        titleLbl.trailingAnchor.constraint(equalTo: marginGuide.trailingAnchor).isActive = true
        titleLbl.bottomAnchor.constraint(equalTo: marginGuide.bottomAnchor).isActive = true
        titleLbl.leadingAnchor.constraint(equalTo: marginGuide.leadingAnchor).isActive = true

        contentView.addSubview(barView)
        barView.backgroundColor = ColorBrand.appColorWhite
        barView.frame = CGRect(x: UIScreen.main.bounds.width / 2 - 3, y: 0, width: 6, height: 36)
        contentView.addSubview(rightTitleLbl)
        rightTitleLbl.frame = CGRect(x: UIScreen.main.bounds.width / 2 + 20, y: 0, width: 150, height: 40)
        rightTitleLbl.textColor = ColorBrand.appColorWhite
        rightTitleLbl.font = FontBrand.tableHeaderFooterFont
        rightTitleLbl.backgroundColor = ColorBrand.tableViewSectionIndexBackgroundColor
    }

    required init?(coder _: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    // --------------------------------------
    // MARK: Events
    // --------------------------------------

    @objc private func _tapHeader(_ gestureRecognizer: UITapGestureRecognizer) {
        guard let cell = gestureRecognizer.view as? CollapsibleTableViewHeader else {
            return
        }
        delegate?.toggleSection(self, section: cell.section)
    }

    // --------------------------------------
    // MARK: Public
    // --------------------------------------

    func setCollapsed(_ collapsed: Bool, duration: CFTimeInterval = 0.2) {
        arrowImgView.rotate(collapsed ? .pi : 0.0, duration: duration)
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        barView.borders(for: [.left, .right], width: 0.5, color: ColorBrand.appColorBlack.withAlphaComponent(0.3))
    }
}
