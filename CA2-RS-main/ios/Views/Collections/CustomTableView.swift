import DifferenceKit
import DZNEmptyDataSet
import TPKeyboardAvoiding
import UIKit

@objc
protocol CustomTableViewDelegate: AnyObject {
    @objc func setupCell(_ cell: UITableViewCell, cellDict: [String: Any]?, indexPath: IndexPath)
    @objc optional func didSelectTableCell(_ cell: UITableViewCell, sectionTitle: String?, cellDict: [String: Any]?, indexPath: IndexPath)
    @objc optional func refreshData()
    @objc optional func tableView(_ tableView: UITableView, sectionTitle: String?, cellDict: [String: Any]?, commitEditingStyle: UITableViewCell.EditingStyle, indexPath: IndexPath)
    @objc optional func tableView(_ tableView: UITableView, canEditRowAt indexPath: IndexPath) -> Bool
    @objc optional func handleSearchEvent(searchContent: String)
    @objc optional func tableView(_ tableView: UITableView, cellDict: [String: Any]?, trailingSwipeActionsConfigurationForRowAt indexPath: IndexPath) -> UISwipeActionsConfiguration?
}

class CustomTableView: TPKeyboardAvoidingTableView, UITableViewDataSource, UITableViewDelegate {
    weak var proxyDataSource: UITableViewDataSource?
    weak var proxyDelegate: UITableViewDelegate?
    var isLoading: Bool = false

    private let kHeaderIdentifier = "header"

    private var _hasHeaderSection: Bool = false
    private var _hasFooterSection: Bool = false
    private var _isHeaderCollapsible: Bool = false
    private var _headerFooterBackgroundColor: UIColor = ColorBrand.tableViewHeaderBackgroundColor
    private var _headerFooterTextColor: UIColor = ColorBrand.tableViewHeaderTextColor
    private var _cellSectionData: [[String: Any]] = []
    private var _selectedIndexPath: IndexPath?
    private weak var _delegate: CustomTableViewDelegate?
    private var _refreshView: RefreshView?
    private var _emptyDataText: String?
    private var _emptyDataIconImage: UIImage?
    private var _emptyDataDescription: String?
    private var _didLoad: Bool = false
    private var _reloadDataCompletionBlock: (() -> Void)?

    // --------------------------------------
    // MARK: Life Cycle
    // --------------------------------------

    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        _customInit()
    }

    override init(frame: CGRect, style: UITableView.Style) {
        super.init(frame: frame, style: style)
        _customInit()
    }

    override func awakeFromNib() {
        super.awakeFromNib()
        _customInit()
    }

    override func draw(_ rect: CGRect) {
        super.draw(rect)
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        _reloadDataCompletionBlock?()
        _reloadDataCompletionBlock = nil
    }

    // --------------------------------------
    // MARK: Private
    // --------------------------------------

    private func _customInit() {
        _cellSectionData = []
        dataSource = self
        delegate = self
        showsVerticalScrollIndicator = true
        keyboardDismissMode = .onDrag
    }

    @objc private func _refresh() {
        _refreshView?.showActivity()
        _delegate?.refreshData?()
    }

    // --------------------------------------
    // MARK: <UITableViewDataSource>
    // --------------------------------------

    func numberOfSections(in _: UITableView) -> Int {
        let numSection = _cellSectionData.count
        return numSection
    }

    func tableView(_: UITableView, numberOfRowsInSection section: Int) -> Int {
        guard let sectionData = _cellSectionData[section][kSectionDataKey] as? [Any] else { return 0 }
        let numRows = sectionData.count
        if !_isHeaderCollapsible {
            return numRows
        } else {
            let sectionTitle = _cellSectionData[section][kSectionTitleKey] as? String ?? ""
            let collapsed = _cellSectionData[section][kSectionCollapsedKey] as? Bool ?? false
            return sectionTitle != "" ? collapsed ? numRows : 0 : numRows
        }
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let sectionData = _cellSectionData[indexPath.section][kSectionDataKey] as? [Any]
        let cellDict = sectionData![indexPath.row] as? [String: Any]
        let cell = tableView.dequeueReusableCell(withIdentifier: (cellDict![kCellIdentifierKey] as? String)!, for: indexPath)
        _delegate?.setupCell(cell, cellDict: cellDict, indexPath: indexPath)
        cell.updateFocusIfNeeded()
        return cell
    }

    func tableView(_ tableView: UITableView, canEditRowAt indexPath: IndexPath) -> Bool {
        if proxyDataSource != nil {
            return proxyDataSource?.tableView?(self, canEditRowAt: indexPath) ?? false
        }
        return ((_delegate?.tableView?(tableView, canEditRowAt: indexPath)) != nil)
    }

    func tableView(_ tableView: UITableView, commit commitEditingStyle: UITableViewCell.EditingStyle, forRowAt indexPath: IndexPath) {
        guard let sectionData = _cellSectionData[indexPath.section][kSectionDataKey] as? [Any] else { return }
        let sectionTitle = _cellSectionData[indexPath.section][kSectionTitleKey] as? String ?? ""
        let cellDict = sectionData[indexPath.row] as? [String: Any]
        _delegate?.tableView?(tableView, sectionTitle: sectionTitle, cellDict: cellDict, commitEditingStyle: commitEditingStyle, indexPath: indexPath)
    }
    
    func tableView(_ tableView: UITableView, trailingSwipeActionsConfigurationForRowAt indexPath: IndexPath) -> UISwipeActionsConfiguration? {
        if proxyDelegate != nil {
            return proxyDelegate?.tableView?(tableView, trailingSwipeActionsConfigurationForRowAt: indexPath)
        }
        else {
            let sectionData = _cellSectionData[indexPath.section][kSectionDataKey] as? [Any]
            let cellDict = sectionData![indexPath.row] as? [String: Any]
            return _delegate?.tableView?(tableView, cellDict: cellDict, trailingSwipeActionsConfigurationForRowAt: indexPath)
        }
    }

    // --------------------------------------
    // MARK: <UITableViewDelegate>
    // --------------------------------------

    func tableView(_: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        if _hasHeaderSection {
            if proxyDelegate != nil {
                return (proxyDelegate?.tableView?(self, heightForHeaderInSection: section))!
            }
            let sectionTitle = _cellSectionData[section][kSectionTitleKey] as? String ?? ""
            let sectionSearchable = _cellSectionData[section][kSectionSearchInputKey] as? Bool ?? false
            let height = sectionSearchable ? kHeaderSearchInnputLayoutHeight : kHeaderFooterHeight
            return sectionTitle == "" ? .zero : height
        }
        if proxyDelegate != nil {
            return proxyDelegate?.tableView?(self, heightForHeaderInSection: section) ?? 0.001
        }
        return .zero
    }

    func tableView(_: UITableView, heightForFooterInSection section: Int) -> CGFloat {
        if proxyDelegate != nil {
            return proxyDelegate?.tableView?(self, heightForFooterInSection: section) ?? .zero
        }
        return .zero
    }

    func tableView(_: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        if _hasHeaderSection {
            if proxyDelegate != nil {
                return (proxyDelegate?.tableView?(self, viewForHeaderInSection: section))
            }
            let sectionTitle = _cellSectionData[section][kSectionTitleKey] as? String ?? ""
            let collapsed = _cellSectionData[section][kSectionCollapsedKey] as? Bool ?? false
            let textAlignment = _cellSectionData[section][kSectionTextAlignmentKey] as? NSTextAlignment ?? .left
            let isBarView = _cellSectionData[section][kSectionbarViewKey] as? Bool ?? true
            let sectionSearchable = _cellSectionData[section][kSectionSearchInputKey] as? Bool ?? false
            if sectionSearchable {
                let placeholder = _cellSectionData[section][kSectionSearchInputPlaceholderKey] as? String ?? ""
                let btnLbl = _cellSectionData[section][kSectionSearchInputButtonLblKey] as? String ?? ""
                return buildHeaderSearchInputView(text: sectionTitle, section: section, placeholder: placeholder, buttonLbl: btnLbl)
            }
            return sectionTitle == "" ? nil : buildHeaderFooterView(text: sectionTitle,section: section, alignment: textAlignment,collapsed: collapsed, barView: isBarView)
        }
        if proxyDelegate != nil {
            return proxyDelegate?.tableView?(self, viewForHeaderInSection: section)
        }
        return UIView.init(frame: .zero)
    }

    func tableView(_: UITableView, viewForFooterInSection _: Int) -> UIView? {
        UIView.init(frame: .zero)
    }

    func tableView(_: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        let sectionData = _cellSectionData[indexPath.section][kSectionDataKey] as? [Any]
        let cellDict = sectionData![indexPath.row] as? [String: Any]
        let height = cellDict![kCellHeightKey] as! CGFloat
        return height == -1 ? UITableView.automaticDimension : height
    }

    func tableView(_: UITableView, willDisplay cell: UITableViewCell, forRowAt indexPath: IndexPath) {
        cell.separatorInset = UIEdgeInsets.zero
        cell.preservesSuperviewLayoutMargins = false
        cell.layoutMargins = UIEdgeInsets.zero
        if proxyDelegate != nil {
            proxyDelegate?.tableView?(self, willDisplay: cell, forRowAt: indexPath)
        }
    }

    func tableView(_: UITableView, didEndDisplaying cell: UITableViewCell, forRowAt indexPath: IndexPath) {
        if proxyDelegate != nil {
            proxyDelegate?.tableView?(self, didEndDisplaying: cell, forRowAt: indexPath)
        }
    }

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        guard let sectionData = _cellSectionData[indexPath.section][kSectionDataKey] as? [Any] else { return }
        let sectionTitle = _cellSectionData[indexPath.section][kSectionTitleKey] as? String ?? ""
        let cellDict = sectionData[indexPath.row] as? [String: Any]
        let cell = tableView.cellForRow(at: indexPath)
        _selectedIndexPath = indexPath
        _delegate?.didSelectTableCell?(cell!, sectionTitle: sectionTitle, cellDict: cellDict, indexPath: indexPath)
    }

    // --------------------------------------
    // MARK: Public
    // --------------------------------------

    var isDataEmpty: Bool {
        if _cellSectionData.count == 0 {
            return true
        } else {
            guard let sectionData = _cellSectionData.first?[kSectionDataKey] as? [Any] else {
                return true
            }
            return sectionData.count == 0
        }
    }

    var isRefreshing: Bool {
        refreshControl != nil && refreshControl!.isRefreshing
    }
    
    var rowCount: Int {
        var count = 0
        self._cellSectionData.forEach { sectionData in
            let values: [Any] = sectionData[kSectionDataKey] as! [Any]
            count += values.count
        }
        return count
    }

    func setup(
        cellPrototypes: [[String: Any]]?, hasHeaderSection: Bool = false, hasFooterSection: Bool = false,
        isHeaderCollapsible: Bool = false, headerFooterBackgroundColor: UIColor = ColorBrand.tableViewHeaderBackgroundColor,
        headerFooterTextColor: UIColor = ColorBrand.tableViewHeaderTextColor,
        enableRefresh: Bool = false, emptyDataText: String? = nil, emptyDataIconImage: UIImage? = nil,
        emptyDataDescription: String? = nil, delegate: CustomTableViewDelegate) {
        // Assign values
        _delegate = delegate
        _hasHeaderSection = hasHeaderSection
        _hasFooterSection = hasFooterSection
        _headerFooterBackgroundColor = headerFooterBackgroundColor
        _headerFooterTextColor = headerFooterTextColor
        _isHeaderCollapsible = isHeaderCollapsible
        _emptyDataText = emptyDataText
        _emptyDataIconImage = emptyDataIconImage
        _emptyDataDescription = emptyDataDescription
        if !_hasFooterSection { tableFooterView = UIView(frame: CGRect.zero) }

        // Register all the prototype UITableViewCell for the current UITableView
        for cellPrototype in cellPrototypes ?? [] {
            let nibName = cellPrototype[kCellNibNameKey] as? String
            let identifier = cellPrototype[kCellIdentifierKey] as? String
            register(UINib(nibName: nibName!, bundle: nil), forCellReuseIdentifier: identifier!)
        }

        // Add the refresh control
        if enableRefresh {
            let refreshControl = UIRefreshControl()
            refreshControl.backgroundColor = UIColor.clear
            refreshControl.tintColor = UIColor.clear
            refreshControl.addTarget(self, action: #selector(_refresh), for: .valueChanged)
            refreshControl.autoresizesSubviews = true
            self.refreshControl = refreshControl
            _refreshView = RefreshView(frame: self.refreshControl!.frame)
            self.refreshControl?.addSubview(_refreshView!)
        }

        // Placeholder
        emptyDataSetSource = self
        emptyDataSetDelegate = self
    }

    func buildHeaderSearchInputView(
        text: String?, section: Int, placeholder: String = "",
        buttonLbl: String = "") -> SearchInputTableViewHeader {
        let header = dequeueReusableHeaderFooterView(withIdentifier: kHeaderIdentifier) as? SearchInputTableViewHeader
            ?? SearchInputTableViewHeader(reuseIdentifier: kHeaderIdentifier, placeholder: placeholder, backgroundColor: _headerFooterBackgroundColor)
        header.titleLbl.text = text
        header.searchBtn.setTitle(buttonLbl, for: .normal)
        header.section = section
        header.delegate = self
        return header
    }

    func buildHeaderFooterView(
        text: String?, section: Int, alignment: NSTextAlignment = .left,
        collapsed: Bool = false, barView: Bool = true) -> CollapsibleTableViewHeader {
        let header = dequeueReusableHeaderFooterView(withIdentifier: kHeaderIdentifier) as? CollapsibleTableViewHeader
            ?? CollapsibleTableViewHeader(
                reuseIdentifier: kHeaderIdentifier,
                collapsible: _isHeaderCollapsible,
                collapsed: collapsed,
                backgroundColor: _headerFooterBackgroundColor)
        header.titleLbl.text = text
        header.titleLbl.textAlignment = alignment
        header.titleLbl.textColor = _headerFooterTextColor
        header.section = section
        header.delegate = self
        header.rightTitleLbl.isHidden = barView
        header.rightTitleLbl.text = text
        header.barView.isHidden = barView
        if !collapsed {
            header.arrowImgView.image = UIImage(named: "icon-action-chevrondown")
        } else {
            header.arrowImgView.image = UIImage(named: "icon-action-chevronup")
        }
        return header
    }
    
    func loadData(_ data: [[String: Any]]?) {
        _didLoad = true
        _cellSectionData = data ?? []
        reload()
    }

    /*
     * Update data by finding difference between source and destination, then perform update by IndexSet
     * dataInput must conform to Differentiable
     * REQUIRE: kCellDifferenceIdentifierKey for the DifferenceKit to compare if 2 rows are different
     * EX: kCellDifferenceIdentifierKey: account.accountId
     * REQUIRE: kCellDifferenceContentKey for the DifferenceKit to compare if the same row should update UI
     * EX: kCellDifferenceContentKey: account.hash
     * Of course, we need to override variable hash in the loading model (in the example is account)
     * EX:
     * override var hash: Int {
     *     var hasher = Hasher()
     *     hasher.combine(accountId)
     *     hasher.combine(accountNo)
     *     ...
     *     return hasher.finalize()
     * }
     */
    func updateData(_ dataInput: [[String: Any]]?, animation: RowAnimation = UITableView.RowAnimation.fade) {

        _didLoad = true
        let data = dataInput ?? []

        var source: [ArraySection<SectionDifferenceModel, [String: Any]>] = []
        for (idx, section) in _cellSectionData.enumerated() {
            source.append(ArraySection(model: .section(idx), elements: section[kSectionDataKey] as? [[String: Any]] ?? []))
        }

        var target: [ArraySection<SectionDifferenceModel, [String: Any]>] = []
        for (idx, section) in data.enumerated() {
            target.append(ArraySection(model: .section(idx), elements: section[kSectionDataKey] as? [[String: Any]] ?? []))
        }

        let changes = StagedChangeset(source: source, target: target)
        reload(using: changes, with: animation, interrupt: { $0.changeCount > kMaxDifferenceData }, setData: { updatingSections in
            var sections: [[String: Any]] = []
            for (idx, updatingSection) in updatingSections.enumerated() {
                var section = data.count > idx ? data[idx] : [:]
                section[kSectionDataKey] = updatingSection.elements
                sections.append(section)
            }
            self._cellSectionData = sections
            self.reloadEmptyDataSet()
        })
    }

    func clear() {
        _cellSectionData.removeAll()
        reload()
    }

    func clearAndReload() {
        _cellSectionData.removeAll()
        reload()
    }

    func reload() {
        reloadData()
    }

    func reload(completion: @escaping () -> Void) {
        _reloadDataCompletionBlock = completion
        reloadData()
    }

    func endRefreshing() {
        refreshControl?.endRefreshing()
        _refreshView?.hideActivity()
    }
}

extension CustomTableView: DZNEmptyDataSetSource, DZNEmptyDataSetDelegate {

    // --------------------------------------
    // MARK: <DZNEmptyDataSetSource>
    // --------------------------------------

    func title(forEmptyDataSet _: UIScrollView!) -> NSAttributedString! {
        if !_didLoad || isLoading {
            return nil
        }
        return NSAttributedString(string: _emptyDataText ?? NSLocalizedString("no_available_data", comment: ""), attributes: [
            NSAttributedString.Key.font: FontBrand.navBarTitleFont,
            NSAttributedString.Key.foregroundColor: ColorBrand.appColorDarkGray
        ])
    }

    func description(forEmptyDataSet _: UIScrollView!) -> NSAttributedString! {
        if !_didLoad || isLoading {
            return nil
        }
        return NSAttributedString(string: _emptyDataDescription ?? "", attributes: [
            NSAttributedString.Key.font: FontBrand.labelFont,
            NSAttributedString.Key.foregroundColor: ColorBrand.appColorDarkGray
        ])
    }

    func image(forEmptyDataSet _: UIScrollView!) -> UIImage! {
        if !_didLoad || isLoading {
            return nil
        }
        return _emptyDataIconImage ?? UIImage()
    }

    func backgroundColor(forEmptyDataSet _: UIScrollView!) -> UIColor! {
        UIColor.clear
    }

    func spaceHeight(forEmptyDataSet _: UIScrollView!) -> CGFloat {
        16.0
    }

    // --------------------------------------
    // MARK: <DZNEmptyDataSetDelegate>
    // --------------------------------------

    func emptyDataSetShouldDisplay(_: UIScrollView!) -> Bool {
        isDataEmpty
    }

    func emptyDataSetShouldAllowTouch(_: UIScrollView!) -> Bool {
        false
    }

    func emptyDataSetShouldAllowScroll(_: UIScrollView!) -> Bool {
        true
    }

    func emptyDataSetShouldAnimateImageView(_: UIScrollView!) -> Bool {
        false
    }
}

extension CustomTableView: CollapsibleTableViewHeaderDelegate {
    func toggleSection(_ header: CollapsibleTableViewHeader, section: Int) {
        guard var collapsed = _cellSectionData[section][kSectionCollapsedKey] as? Bool else { return }
        collapsed = !collapsed
        _cellSectionData[section][kSectionCollapsedKey] = collapsed
        header.setCollapsed(collapsed)
        beginUpdates()
        reloadSections(NSIndexSet(index: section) as IndexSet, with: .none)
        if collapsed {
            DISPATCH_ASYNC_MAIN_AFTER(0.15) {
                let indexPath = IndexPath(row: 0, section: section)
                self.scrollToRow(at: indexPath, at: .top, animated: true)
            }
        }
        endUpdates()
    }
}

extension CustomTableView: SearchInputTableViewHeaderDelegate {
    @objc func handleSearchBtnEvent(_: SearchInputTableViewHeader, section _: Int, searchContent: String) {
        _delegate?.handleSearchEvent?(searchContent: searchContent)
    }
}
