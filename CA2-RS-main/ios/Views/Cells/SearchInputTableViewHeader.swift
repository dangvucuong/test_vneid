import UIKit

@objc
protocol SearchInputTableViewHeaderDelegate: AnyObject {
    @objc optional func handleSearchEditBeginEvent(_ header: SearchInputTableViewHeader, section: Int, searchContent: String)
    @objc optional func handleSearchEditEndEvent(_ header: SearchInputTableViewHeader, section: Int, searchContent: String)
    @objc optional func handleSearchBtnEvent(_ header: SearchInputTableViewHeader, section: Int, searchContent: String)
}

class SearchInputTableViewHeader: UITableViewHeaderFooterView {
    weak var delegate: SearchInputTableViewHeaderDelegate?
    var section: Int = 0
    let searchBtn = UIButton()

    let titleLbl = UILabel()
    private let searchBar = UISearchBar()
    private var _backgroundColor: UIColor?

    // --------------------------------------
    // MARK: Life Cycle
    // --------------------------------------

    init(reuseIdentifier: String?, placeholder: String = NSLocalizedString("search", comment: ""), backgroundColor: UIColor = ColorBrand.tableViewHeaderBackgroundColor) {
        super.init(reuseIdentifier: reuseIdentifier)
        let marginGuide = contentView.layoutMarginsGuide

        _backgroundColor = backgroundColor
        contentView.backgroundColor = _backgroundColor

        contentView.addSubview(titleLbl)
        titleLbl.textColor = ColorBrand.appColorWhite
        titleLbl.font = FontBrand.tableHeaderFooterFont
        titleLbl.backgroundColor = ColorBrand.tableViewSectionIndexBackgroundColor
        titleLbl.translatesAutoresizingMaskIntoConstraints = false
        titleLbl.topAnchor.constraint(equalTo: marginGuide.topAnchor).isActive = true
        titleLbl.trailingAnchor.constraint(equalTo: marginGuide.trailingAnchor).isActive = true
        titleLbl.leadingAnchor.constraint(equalTo: marginGuide.leadingAnchor).isActive = true

        contentView.addSubview(searchBtn)
        searchBtn.titleLabel?.textColor = ColorBrand.appColorWhite
        searchBtn.titleLabel?.font = FontBrand.tableHeaderFooterFont
        searchBtn.translatesAutoresizingMaskIntoConstraints = false
        searchBtn.widthAnchor.constraint(equalToConstant: 72).isActive = true
        searchBtn.heightAnchor.constraint(equalToConstant: 38).isActive = true
        searchBtn.trailingAnchor.constraint(equalTo: marginGuide.trailingAnchor).isActive = true
        searchBtn.bottomAnchor.constraint(equalTo: marginGuide.bottomAnchor).isActive = true
        searchBtn.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(SearchInputTableViewHeader._tapButton(_:))))

        contentView.addSubview(searchBar)
        searchBar.placeholder = placeholder
        searchBar.sizeToFit()
        searchBar.layer.cornerRadius = 10
        searchBar.clipsToBounds = true
        searchBar.backgroundColor = ColorBrand.appColorWhite
        searchBar.translatesAutoresizingMaskIntoConstraints = false
        searchBar.heightAnchor.constraint(equalToConstant: 38).isActive = true
        searchBar.bottomAnchor.constraint(equalTo: marginGuide.bottomAnchor).isActive = true
        searchBar.leadingAnchor.constraint(equalTo: marginGuide.leadingAnchor).isActive = true
        searchBar.trailingAnchor.constraint(equalTo: searchBtn.leadingAnchor, constant: -24).isActive = true
    }

    required init?(coder _: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    // --------------------------------------
    // MARK: Events
    // --------------------------------------

    @objc private func _tapButton(_: UITapGestureRecognizer) {
        delegate?.handleSearchBtnEvent?(self, section: section, searchContent: searchBar.text ?? "")
    }
}
