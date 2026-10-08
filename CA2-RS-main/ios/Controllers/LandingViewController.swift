import UIKit

class LandingViewController: NavigationBarViewController {

    @IBOutlet weak var _collectionView: CustomCollectionView!
    
    // --------------------------------------
    // MARK: Life Cycle
    // --------------------------------------
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // SETUP LOGO
        setLogoImage(UIImage(named: "ic_header_logo"))
        
        // SETUP COLLECTION VIEW
        let margin = kCollectionViewDefaultMargin
        let spacing = kCollectionViewDefaultSpacing
        _collectionView.setup(
            cellPrototypes: _prototypes,
            hasHeaderSection: false,
            enableRefresh: false,
            columns: 3, rows: 1,
            edgeInsets: UIEdgeInsets(top: margin, left: margin, bottom: margin, right: margin),
            spacing: CGSize(width: spacing, height: spacing),
            emptyDataText: LOCALIZED("message_empty_dashboard_title"),
            emptyDataIconImage: nil,
            emptyDataDescription: LOCALIZED("message_empty_dashboard_description"),
            delegate: self)
        _collectionView.proxyLayout = self
        _collectionView.backgroundColor = UIColor.clear
        
        // LOAD DATA
        _loadData()
    }
    
    // --------------------------------------
    // MARK: Private
    // --------------------------------------
    
    private var _prototypes: [[String: Any]]? {
        return [[kCellIdentifierKey: "dashboardCellIdentifier", kCellNibNameKey: String(describing: DashboardCollectionCell.self), kCellClassKey: DashboardCollectionCell.self]]
    }
    
    private func _loadData() {
        var cellSectionData = [[String: Any]]()
        var cellData = [[String: Any]]()
        MODULESMANAGER.getAllModules().forEach { module in
            cellData.append([
                kCellIdentifierKey: "dashboardCellIdentifier",
                kCellClassKey: DashboardCollectionCell.self,
                kCellTagKey: module.type,
                kCellTitleKey: module.title,
                kCellIconImageKey: module.iconImageName,
                kCellHeightKey: DashboardCollectionCell.height,
                kCellDifferenceIdentifierKey: module.title,
                kCellEnabledKey: module.enable
            ])
        }
        cellSectionData.append([kSectionTitleKey: "", kSectionDataKey: cellData])
        _collectionView.updateData(cellSectionData)
    }
}

extension LandingViewController: CustomCollectionViewDelegate, UICollectionViewDelegateFlowLayout {
        
    // --------------------------------------
    // MARK: <CustomCollectionViewDelegate>
    // --------------------------------------

    func setupCollectionCell(_ cell: UICollectionViewCell, cellDict: [String: Any]?, indexPath: IndexPath) {
        let title = cellDict?[kCellTitleKey] as! String
        let iconImageName = cellDict?[kCellIconImageKey] as! String
        let enable = cellDict?[kCellEnabledKey] as! Bool
        guard let dashboardCell = cell as? DashboardCollectionCell else { return }
        dashboardCell.setup(title: title, iconImageName: iconImageName, enable: enable)
    }
    
    func didSelectCell(_ cell: UICollectionViewCell, sectionTitle: String?, cellDict: [String : Any]?, indexPath: IndexPath) {
        let enable = cellDict?[kCellEnabledKey] as! Bool
        if enable == false { return }
        let type = cellDict?[kCellTagKey] as! BusinessType
        let controller = MODULESMANAGER.initController(type)
        self.navigationController?.pushViewController(controller, animated: true)
    }
        
    // --------------------------------------
    // MARK: <UICollectionViewDelegateFlowLayout>
    // --------------------------------------
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        if collectionView == _collectionView {
            var size = _collectionView.cellSize
            size = CGSize(width: size.width, height: DashboardCollectionCell.height)
            return size
        }
        return .zero
    }
    
}
