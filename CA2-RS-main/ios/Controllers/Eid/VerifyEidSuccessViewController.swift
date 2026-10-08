import UIKit

class VerifyEidSuccessViewController: NavigationBarViewController, CustomTableViewDelegate {
    
    @IBOutlet weak var tableView: CustomTableView!
    @IBOutlet weak var doneButton: UIButton!
    
    private let kImageTableCellIdentifier = "imagetablecell"
    private let kInfoTableCellIdentifier = "infotablecell"
    
    public var isSegmentChild: Bool = false
    
    //adjustable contrainst
    @IBOutlet weak var bottomToSuperViewContrainst: NSLayoutConstraint!
    @IBOutlet weak var bottomTbViewToBtnContrainst: NSLayoutConstraint!
    
    // --------------------------------------
    // MARK: Life Cycle
    // --------------------------------------
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
        if #available(iOS 16.0, *) {
            self.navigationItem.leftBarButtonItem?.isHidden = true
        } else {
            // Fallback on earlier versions
        }
    }
        
    override var leftBarButton: UIButton? {
        let button = UIButton(frame: CGRect(x: 0, y: 0, width: 24, height: 24))
        button.backgroundColor = .clear
        button.setImage(UIImage(named: "ic_action_arrowback"), for: .normal)
        button.tintColor = .white
        return button
    }
    
    override func handleLeftBarButtonEvent() {
        if let navigationController = self.navigationController {
            navigationController.popViewController(animated: true)
        }
    }
    
    // --------------------------------------
    // MARK: Private
    // --------------------------------------
    override func setupUI() {
        if isSegmentChild {
            doneButton.isHidden = true
            bottomTbViewToBtnContrainst.isActive = false
            bottomToSuperViewContrainst.constant  = 0
        }
        doneButton.setTitle(LOCALIZED("done_button").uppercased(), for: .normal)
        self.title = LOCALIZED("verify_success").uppercased()
        doneButton.layer.cornerRadius = doneButton.frame.height / 2
        tableView.layer.cornerRadius = kCornerRadius
        tableView.setup(cellPrototypes: _prototypes, hasHeaderSection: false, enableRefresh: false, delegate: self)
        loadTableData()
    }
    
    private var _prototypes: [[String:Any]]? {
        return [
            [kCellIdentifierKey: kImageTableCellIdentifier, kCellNibNameKey: String(describing: ImageTableCell.self), kCellClassKey: ImageTableCell.self],
            [kCellIdentifierKey: kInfoTableCellIdentifier, kCellNibNameKey: String(describing: InfoTableCell.self), kCellClassKey: InfoTableCell.self],
        ]
    }
    
    private func loadTableData() {
        guard let eid = ONBOARDDATAMANAGER.eid else {return}
        
        let eidImage = eid.faceImage
        let personOptionalDetails = eid.personOptionalDetails
        
        var cellSectionData = [[String: Any]]()
        
        // --------------------------------------
        // IMAGE DATA
        // --------------------------------------
        var imageData = [[String: Any]]()
        imageData.append([
            kCellIdentifierKey: kImageTableCellIdentifier,
            kCellClassKey: ImageTableCell.self,
            kCellHeightKey: ImageTableCell.height,
            kCellImageKey: eidImage ?? UIImage(named: "img_avatarholder") as Any
        ])
        
        cellSectionData.append([kSectionTitleKey: "", kSectionDataKey: imageData, kSectionCollapsedKey: false])
        
        
        // --------------------------------------
        // PERSONAL OPTIONAL DETAILS
        // --------------------------------------
        
        var personalData = [[String: Any]]()
        personalData.append([
            kCellIdentifierKey: kInfoTableCellIdentifier,
            kCellClassKey: InfoTableCell.self,
            kCellHeightKey: InfoTableCell.height,
            kCellTitleKey: LOCALIZED("label_eid_number:"),
            kCellInformationKey: personOptionalDetails?.eidNumber ?? ""
        ])
        
        personalData.append([
            kCellIdentifierKey: kInfoTableCellIdentifier,
            kCellClassKey: InfoTableCell.self,
            kCellHeightKey: InfoTableCell.height,
            kCellTitleKey: LOCALIZED("label_name:"),
            kCellInformationKey: personOptionalDetails?.fullName ?? ""
        ])
        
        personalData.append([
            kCellIdentifierKey: kInfoTableCellIdentifier,
            kCellClassKey: InfoTableCell.self,
            kCellHeightKey: InfoTableCell.height,
            kCellTitleKey: LOCALIZED("label_gender:"),
            kCellInformationKey: personOptionalDetails?.gender ?? ""
        ])
        
        personalData.append([
            kCellIdentifierKey: kInfoTableCellIdentifier,
            kCellClassKey: InfoTableCell.self,
            kCellHeightKey: InfoTableCell.height,
            kCellTitleKey: LOCALIZED("label_date_of_birth:"),
            kCellInformationKey: personOptionalDetails?.dateOfBirth ?? ""
        ])
               
        personalData.append([
            kCellIdentifierKey: kInfoTableCellIdentifier,
            kCellClassKey: InfoTableCell.self,
            kCellHeightKey: InfoTableCell.height,
            kCellTitleKey: LOCALIZED("label_date_of_issue:"),
            kCellInformationKey: personOptionalDetails?.dateOfIssue ?? ""
        ])
        
        personalData.append([
            kCellIdentifierKey: kInfoTableCellIdentifier,
            kCellClassKey: InfoTableCell.self,
            kCellHeightKey: InfoTableCell.height,
            kCellTitleKey: LOCALIZED("label_date_of_expiry:"),
            kCellInformationKey: personOptionalDetails?.dateOfExpiry ?? ""
        ])
        
        personalData.append([
            kCellIdentifierKey: kInfoTableCellIdentifier,
            kCellClassKey: InfoTableCell.self,
            kCellHeightKey: InfoTableCell.height,
            kCellTitleKey: LOCALIZED("label_ethnicity:"),
            kCellInformationKey: personOptionalDetails?.ethnicity ?? ""
        ])
        
        personalData.append([
            kCellIdentifierKey: kInfoTableCellIdentifier,
            kCellClassKey: InfoTableCell.self,
            kCellHeightKey: InfoTableCell.height,
            kCellTitleKey: LOCALIZED("label_religion:"),
            kCellInformationKey: personOptionalDetails?.religion ?? ""
        ])
        
//        personalData.append([
//            kCellIdentifierKey: kInfoTableCellIdentifier,
//            kCellClassKey: InfoTableCell.self,
//            kCellHeightKey: InfoTableCell.height,
//            kCellTitleKey: LOCALIZED("label_nationality:"),
//            kCellInformationKey: personOptionalDetails?.nationality ?? LOCALIZED("not_supported")
//        ])
        
        personalData.append([
            kCellIdentifierKey: kInfoTableCellIdentifier,
            kCellClassKey: InfoTableCell.self,
            kCellHeightKey: InfoTableCell.height,
            kCellTitleKey: LOCALIZED("label_place_of_origin:"),
            kCellInformationKey: personOptionalDetails?.placeOfOrigin ?? ""
        ])
        
        personalData.append([
            kCellIdentifierKey: kInfoTableCellIdentifier,
            kCellClassKey: InfoTableCell.self,
            kCellHeightKey: InfoTableCell.height,
            kCellTitleKey: LOCALIZED("label_place_of_residence:"),
            kCellInformationKey: personOptionalDetails?.placeOfResidence ?? ""
        ])
        
        personalData.append([
            kCellIdentifierKey: kInfoTableCellIdentifier,
            kCellClassKey: InfoTableCell.self,
            kCellHeightKey: InfoTableCell.height,
            kCellTitleKey: LOCALIZED("label_identification:"),
            kCellInformationKey: personOptionalDetails?.personalIdentification ?? ""
        ])
        
        personalData.append([
            kCellIdentifierKey: kInfoTableCellIdentifier,
            kCellClassKey: InfoTableCell.self,
            kCellHeightKey: InfoTableCell.height,
            kCellTitleKey: LOCALIZED("label_father_name:"),
            kCellInformationKey: personOptionalDetails?.fatherName ?? ""
        ])
        
        personalData.append([
            kCellIdentifierKey: kInfoTableCellIdentifier,
            kCellClassKey: InfoTableCell.self,
            kCellHeightKey: InfoTableCell.height,
            kCellTitleKey: LOCALIZED("label_mother_name:"),
            kCellInformationKey: personOptionalDetails?.motherName ?? ""
        ])
        
        personalData.append([
            kCellIdentifierKey: kInfoTableCellIdentifier,
            kCellClassKey: InfoTableCell.self,
            kCellHeightKey: InfoTableCell.height,
            kCellTitleKey: LOCALIZED("label_spouse_name:"),
            kCellInformationKey: personOptionalDetails?.spouseName ?? ""
        ])
        
        personalData.append([
            kCellIdentifierKey: kInfoTableCellIdentifier,
            kCellClassKey: InfoTableCell.self,
            kCellHeightKey: InfoTableCell.height,
            kCellTitleKey: LOCALIZED("label_old_id:"),
            kCellInformationKey: personOptionalDetails?.oldEidNumber ?? ""
        ])
        
        personalData.append([
            kCellIdentifierKey: kInfoTableCellIdentifier,
            kCellClassKey: InfoTableCell.self,
            kCellHeightKey: InfoTableCell.height,
            kCellTitleKey: LOCALIZED("label_card_type:"),
            kCellInformationKey: eid.getCardType().localized()
        ])
        
        cellSectionData.append([kSectionTitleKey: LOCALIZED("section_personal"), kSectionDataKey: personalData, kSectionCollapsedKey: false])
                
        // --------------------------------------
        
        tableView?.loadData(cellSectionData)
    }
    
    private func popUpFullImage(_ path: String) {
        let controller = INIT_CONTROLLER_XIB(ShowImageViewController.self)
        controller.imagePath = path
        controller.showMode = .potrait
        DISPATCH_ASYNC_MAIN {
            controller.modalPresentationStyle = .overCurrentContext
            self.present(controller, animated: true, completion: nil)
        }
    }
    
    // --------------------------------------
    // MARK: <CustomTableViewDelegate>
    // --------------------------------------
    func setupCell(_ cell: UITableViewCell, cellDict: [String : Any]?, indexPath: IndexPath) {
        if cell is ImageTableCell {
            let image = cellDict?[kCellImageKey] as? UIImage
            (cell as? ImageTableCell)?.setup(image: image)
        } else if cell is InfoTableCell {
            let title = cellDict?[kCellTitleKey] as? String
            let info = cellDict?[kCellInformationKey] as? String
            (cell as? InfoTableCell)?.setup(title: title, info: info?.uppercased(), colorCode: nil, showDisclosure: false)
        }
    }
    
    func didSelectTableCell(_ cell: UITableViewCell, sectionTitle: String?, cellDict: [String : Any]?, indexPath: IndexPath) {
        if cell is ImageTableCell {
            popUpFullImage(ONBOARDDATAMANAGER.eidFacePath)
        }
    }
    
    // --------------------------------------
    // MARK: Event
    // --------------------------------------
    @IBAction func doneButtonAction(_ sender: UIButton) {
        APPDELEGATE.setupRootController(INIT_CONTROLLER_XIB(LandingViewController.self), false)
    }
}
