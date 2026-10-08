import DifferenceKit
import DZNEmptyDataSet
import TPKeyboardAvoiding
import UIKit

let kCollectionViewDefaultColumns: Int = 2
let kCollectionViewDefaultRows: Int = 4
let kCollectionViewDefaultMargin: CGFloat = 16.0
@available(iOS 13.0, *)
let kCollectionViewDefaultSpacing: CGFloat = APP.isPad ? 16.0 : 8.0

@objc
protocol CustomCollectionViewDelegate: AnyObject {
    @objc func setupCollectionCell(_ cell: UICollectionViewCell, cellDict: [String: Any]?, indexPath: IndexPath)
    @objc optional func didSelectCell(_ cell: UICollectionViewCell, sectionTitle: String?, cellDict: [String: Any]?, indexPath: IndexPath)
    @objc optional func willDisplay(_ collectionView: UICollectionView, cell: UICollectionViewCell, indexPath: IndexPath)
    @objc optional func scrollViewWillEndDragging(_ scrollView: UIScrollView, withVelocity velocity: CGPoint, targetContentOffset: UnsafeMutablePointer<CGPoint>)

    @objc optional func refreshData()
}

class CustomCollectionHeaderView: UICollectionReusableView {
    var titleLbl: UILabel!

    override init(frame: CGRect) {
        super.init(frame: frame)
        _customInit()
    }

    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        _customInit()
    }

    private func _customInit() {
        autoresizesSubviews = true
        let width = bounds.size.width
        titleLbl = UILabel(frame: CGRect(x: kHeaderFooterPadding, y: 0, width: width - kHeaderFooterPadding * 2, height: bounds.size.height))
        titleLbl.backgroundColor = ColorBrand.tableViewSectionIndexBackgroundColor
        titleLbl.textColor = ColorBrand.tableViewHeaderForegroundColor
        titleLbl.font = FontBrand.tableHeaderFooterFont
        titleLbl.text = ""
        titleLbl.textAlignment = .left
        addSubview(titleLbl)
    }
}

class CustomCollectionView: TPKeyboardAvoidingCollectionView, UICollectionViewDataSource, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout {
    weak var proxyDataSource: UICollectionViewDataSource?
    weak var proxyDelegate: UICollectionViewDelegate?
    var proxyLayout: UICollectionViewDelegateFlowLayout?
    var isLoading: Bool = false

    private let kHeaderIdentifier = "header"

    private var _selectedIndexPath: IndexPath?
    private weak var _delegate: CustomCollectionViewDelegate?
    private var _refreshView: RefreshView?
    private var _columns: Int = 0
    private var _hasHeaderSection: Bool = false
    private var _headerBackgroundColor: UIColor = ColorBrand.tableViewHeaderBackgroundColor
    private var _rows: Int = 0
    private var _edgeInsets: UIEdgeInsets = UIEdgeInsets.zero
    private var _spacing: CGSize = CGSize.zero
    private var _emptyDataText: String?
    private var _emptyDataIconImage: UIImage?
    private var _emptyDataDescription: String?
    private var _scrollDirection: UICollectionView.ScrollDirection = .vertical
    private var _didLoad: Bool = false
    private var _cellSectionData: [[String: Any]] = []

    // --------------------------------------
    // MARK: Life Cycle
    // --------------------------------------

    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        _customInit()
    }

    override init(frame: CGRect, collectionViewLayout layout: UICollectionViewLayout) {
        super.init(frame: frame, collectionViewLayout: layout)
        _customInit()
    }

    override func awakeFromNib() {
        super.awakeFromNib()
        _customInit()
    }

    override func draw(_ rect: CGRect) {
        super.draw(rect)
    }

    // --------------------------------------
    // MARK: Private
    // --------------------------------------

    private func _customInit() {
        _cellSectionData = []
        dataSource = self
        delegate = self
        showsHorizontalScrollIndicator = true
        keyboardDismissMode = .onDrag
    }

    @objc private func _refresh() {
        _refreshView?.showActivity()
        _delegate?.refreshData?()
    }

    // --------------------------------------
    // MARK: <UICollectionViewDataSource>
    // --------------------------------------

    func numberOfSections(in _: UICollectionView) -> Int {
        let numSection = _cellSectionData.count
        return numSection
    }

    func collectionView(_: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        guard let sectionData = _cellSectionData[section][kSectionDataKey] as? [Any] else { return 0 }
        let numItems = sectionData.count
        return numItems
    }

    func collectionView(_: UICollectionView, viewForSupplementaryElementOfKind kind: String, at indexPath: IndexPath) -> UICollectionReusableView {
        switch kind {
            case UICollectionView.elementKindSectionHeader:
                let sectionTitle = _cellSectionData[indexPath.section][kSectionTitleKey] as? String ?? ""
                return buildHeaderFooterView(text: sectionTitle, indexpath: indexPath, kind: kind, backgroundColor: _headerBackgroundColor)
            default:
                return UICollectionReusableView()
        }
    }

    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        guard let sectionData = _cellSectionData[indexPath.section][kSectionDataKey] as? [Any] else { return UICollectionViewCell() }
        guard let cellDict = sectionData[indexPath.row] as? [String: Any] else { return UICollectionViewCell() }
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: (cellDict[kCellIdentifierKey] as? String)!, for: indexPath)
        _delegate?.setupCollectionCell(cell, cellDict: cellDict, indexPath: indexPath)
        cell.updateFocusIfNeeded()
        return cell
    }

    // --------------------------------------
    // MARK: <UICollectionViewDelegate>
    // --------------------------------------

    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        collectionView.deselectItem(at: indexPath, animated: true)
        guard let sectionData = _cellSectionData[indexPath.section][kSectionDataKey] as? [Any] else { return }
        guard let sectionTitle = _cellSectionData[indexPath.section][kSectionTitleKey] as? String else { return }
        guard let cellDict = sectionData[indexPath.row] as? [String: Any] else { return }
        let cell = collectionView.cellForItem(at: indexPath)
        _selectedIndexPath = indexPath
        _delegate?.didSelectCell?(cell!, sectionTitle: sectionTitle, cellDict: cellDict, indexPath: indexPath)
    }

    func collectionView(_: UICollectionView, didEndDisplaying cell: UICollectionViewCell, forItemAt indexPath: IndexPath) {
        proxyDelegate?.collectionView?(self, didEndDisplaying: cell, forItemAt: indexPath)
    }

    func collectionView(_ collectionView: UICollectionView, willDisplay cell: UICollectionViewCell, forItemAt indexPath: IndexPath) {
        _delegate?.willDisplay?(collectionView, cell: cell, indexPath: indexPath)
    }

    // --------------------------------------
    // MARK: <UICollectionViewDelegateFlowLayout>
    // --------------------------------------

    func collectionView(_: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        if proxyLayout != nil {
            return proxyLayout?.collectionView?(self, layout: collectionViewLayout, sizeForItemAt: indexPath) ?? cellSize
        }
        return cellSize
    }

    func collectionView(_: UICollectionView, layout _: UICollectionViewLayout, insetForSectionAt _: Int) -> UIEdgeInsets {
        _edgeInsets
    }

    func collectionView(_: UICollectionView, layout _: UICollectionViewLayout, minimumInteritemSpacingForSectionAt _: Int) -> CGFloat {
        _spacing.width
    }

    func collectionView(_: UICollectionView, layout _: UICollectionViewLayout, minimumLineSpacingForSectionAt _: Int) -> CGFloat {
        _spacing.height
    }

    func collectionView(_ collectionView: UICollectionView, layout _: UICollectionViewLayout, referenceSizeForHeaderInSection _: Int) -> CGSize {
        if _hasHeaderSection {
            return CGSize(width: collectionView.bounds.size.width, height: kHeaderFooterHeight)
        } else {
            return CGSize(width: 0, height: 0)
        }
    }
    
    // --------------------------------------
    // MARK: <ScrollViewDelegate>
    // --------------------------------------
    
    override func scrollViewWillEndDragging(_ scrollView: UIScrollView, withVelocity velocity: CGPoint, targetContentOffset: UnsafeMutablePointer<CGPoint>) {
        _delegate?.scrollViewWillEndDragging?(scrollView, withVelocity: velocity, targetContentOffset: targetContentOffset)
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

    var cellSize: CGSize {
        var size = frame.size
        var itemsCount = 0
        let columns = CGFloat(_columns)
        for section in _cellSectionData {
            let sectionData = section[kSectionDataKey] as? [Any]
            itemsCount += sectionData!.count
        }
        let numberOfRows = Int(ceil(CGFloat(itemsCount) / columns))
        let totalRowsCount = max(_rows, numberOfRows)
        let visibleRowsCount = min(totalRowsCount, _rows)
        var width = floor((size.width - _edgeInsets.left - _edgeInsets.right - _spacing.width * (columns - 1.0)) / columns)
        var height = CGFloat(size.height - _edgeInsets.top - _edgeInsets.bottom - _spacing.height) / CGFloat(visibleRowsCount)
        width = width < 0 ? 0 : width
        height = height < 0 ? 0 : height
        size = CGSize(width: width, height: height)
        // Log.debug("rows=\(visibleRowsCount) columns=\(_columns) size=\(size)")
        return size
    }

    func setup(
        cellPrototypes: [[String: Any]]?, hasHeaderSection: Bool = false,
        headerBackgroundColor: UIColor = ColorBrand.tableViewHeaderBackgroundColor,
        enableRefresh: Bool = false, columns: Int = kCollectionViewDefaultColumns, rows: Int = kCollectionViewDefaultRows,
        edgeInsets: UIEdgeInsets = UIEdgeInsets.zero, spacing: CGSize = CGSize.zero,
        scrollDirection: UICollectionView.ScrollDirection = .vertical,
        emptyDataText: String? = nil, emptyDataIconImage: UIImage? = nil, emptyDataDescription: String? = nil,
        delegate: CustomCollectionViewDelegate?) {
        // Assign values
        _hasHeaderSection = hasHeaderSection
        _headerBackgroundColor = headerBackgroundColor
        _delegate = delegate
        _columns = columns > 0 ? columns : kCollectionViewDefaultColumns
        _rows = rows > 0 ? rows : kCollectionViewDefaultRows
        _edgeInsets = edgeInsets
        _spacing = spacing
        _emptyDataText = emptyDataText
        _emptyDataIconImage = emptyDataIconImage
        _emptyDataDescription = emptyDataDescription
        _scrollDirection = scrollDirection

        // Register header prototype
        // if _hasHeaderSection {
        register(CustomCollectionHeaderView.self, forSupplementaryViewOfKind: UICollectionView.elementKindSectionHeader, withReuseIdentifier: kHeaderIdentifier)
        // }

        // Register all the prototype UITableViewCell for the current UICollection
        for cellPrototype in cellPrototypes ?? [] {
            guard let nibName = cellPrototype[kCellNibNameKey] as? String else { return }
            guard let identifier = cellPrototype[kCellIdentifierKey] as? String else { return }
            register(UINib(nibName: nibName, bundle: nil), forCellWithReuseIdentifier: identifier)
        }

        if scrollDirection == .horizontal {
            let horizontalLayout = UICollectionViewFlowLayout()
            horizontalLayout.scrollDirection = .horizontal
            setCollectionViewLayout(horizontalLayout, animated: false)
        }
        // Add the refresh control only if the layout is .vertical
        // Currently we don't support refresh with .horizontal -> it create layout scroll issues
        else if enableRefresh {
            let refreshControl = UIRefreshControl()
            refreshControl.backgroundColor = UIColor.clear
            refreshControl.tintColor = UIColor.clear
            refreshControl.addTarget(self, action: #selector(_refresh), for: .valueChanged)
            refreshControl.autoresizesSubviews = true
            self.refreshControl = refreshControl
            _refreshView = RefreshView(frame: self.refreshControl!.frame)
            self.refreshControl?.addSubview(_refreshView!)
        }
        
        // casting is required because UICollectionViewLayout doesn't offer header pin. Its feature of UICollectionViewFlowLayout
        let layout = collectionViewLayout as? UICollectionViewFlowLayout
        layout?.sectionHeadersPinToVisibleBounds = true

        // Placeholder
        emptyDataSetSource = self
        emptyDataSetDelegate = self
    }

    func buildHeaderFooterView(
        text: String?, indexpath: IndexPath, kind: String = UICollectionView.elementKindSectionHeader,
        alignment: NSTextAlignment = .left, backgroundColor: UIColor = ColorBrand.tableViewHeaderBackgroundColor) -> UICollectionReusableView {
        guard let view = dequeueReusableSupplementaryView(ofKind: kind, withReuseIdentifier: kHeaderIdentifier, for: indexpath)
            as? CustomCollectionHeaderView else { return UICollectionReusableView() }
        view.backgroundColor = _headerBackgroundColor
        view.titleLbl.text = text
        view.titleLbl.textAlignment = alignment
        view.titleLbl.textColor = ColorBrand.tableViewSectionTextColor // backgroundColor == UIColor.clear ? R.color.darkBlue() : ColorBrand.tableViewHeaderForegroundColor
        return view
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
    func updateData(_ dataInput: [[String: Any]]?) {
        _didLoad = true
        let data = dataInput ?? []

        var sourceDataSection: [ArraySection<SectionDifferenceModel, [String: Any]>] = []
        for (idx, section) in _cellSectionData.enumerated() {
            sourceDataSection.append(ArraySection(model: .section(idx), elements: section[kSectionDataKey] as? [[String: Any]] ?? []))
        }

        var destinationDataSection: [ArraySection<SectionDifferenceModel, [String: Any]>] = []
        var destinationHeaders: [String?] = []
        for (idx, section) in data.enumerated() {
            destinationDataSection.append(ArraySection(model: .section(idx), elements: section[kSectionDataKey] as? [[String: Any]] ?? []))
            destinationHeaders.append(section[kSectionTitleKey] as? String)
        }

        let changes = StagedChangeset(source: sourceDataSection, target: destinationDataSection)
        reload(using: changes, interrupt: { $0.changeCount > kMaxDifferenceData }, setData: { updatingSections in
            var sections: [[String: Any]] = []
            for (idx, updatingSection) in updatingSections.enumerated() {
                let section = [
                    kSectionTitleKey: destinationHeaders.count > idx ? destinationHeaders[idx] ?? "" : "",
                    kSectionDataKey: updatingSection.elements
                ] as [String: Any]
                sections.append(section)
            }
            self._cellSectionData = sections
            self.reloadEmptyDataSet()
        })
    }

    func clear() {
        _cellSectionData.removeAll()
    }

    func clearAndReload() {
        _cellSectionData.removeAll()
        reload()
    }

    func reload() {
        reloadData()
    }

    func endRefreshing() {
        refreshControl?.endRefreshing()
        _refreshView?.hideActivity()
    }

    func updateEmptyPlaceholder(emptyDataText: String? = nil, emptyDataIconImage: UIImage? = nil, emptyDataDescription: String? = nil) {
        _emptyDataText = emptyDataText
        _emptyDataIconImage = emptyDataIconImage
        _emptyDataDescription = emptyDataDescription
    }
}

extension CustomCollectionView: DZNEmptyDataSetSource, DZNEmptyDataSetDelegate {

    // --------------------------------------
    // MARK: <DZNEmptyDataSetSource>
    // --------------------------------------

    func title(forEmptyDataSet _: UIScrollView!) -> NSAttributedString! {
        if !_didLoad || isLoading {
            return nil
        }
        return NSAttributedString(string: _emptyDataText ?? NSLocalizedString("no_available_data", comment: ""), attributes: [
            NSAttributedString.Key.font: FontBrand.navBarTitleFont,
            NSAttributedString.Key.foregroundColor: ColorBrand.appColorNavy
        ])
    }

    func description(forEmptyDataSet _: UIScrollView!) -> NSAttributedString! {
        if !_didLoad || isLoading {
            return nil
        }
        return NSAttributedString(string: _emptyDataDescription ?? "", attributes: [
            NSAttributedString.Key.font: FontBrand.labelFont,
            NSAttributedString.Key.foregroundColor: ColorBrand.appColorNavy
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
        true
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
