//
//  SummaryEkybViewController.swift
//  xverifydemoapp
//
//  Created by Nguyễn Hiếu on 16/2/25.
//

import UIKit

class SummaryEkybViewController: NavigationBarViewController {

    @IBOutlet weak var nextButton: UIButton!
    
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var documentTypeValueLbl: UILabel!
    @IBOutlet weak var taxCodeValueLbl: UILabel!
    @IBOutlet weak var bussinessNameValueLbl: UILabel!
    @IBOutlet weak var phoneNumberValueLbl: UILabel!
    @IBOutlet weak var addressValueLbl: UILabel!
    @IBOutlet weak var placeOfIssueValueLbl: UILabel!
    @IBOutlet weak var signerValueLbl: UILabel!
    
    @IBOutlet weak var documentNumberValueLbl: UILabel!
    @IBOutlet weak var representativeNameValueLbl: UILabel!
    @IBOutlet weak var dateOfIssueValueLbl: UILabel!
    @IBOutlet weak var addressOfTheRepresentativeValueLbl: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setLogoImage(UIImage(named: "ic_header_logo"))
    }
    
    override func setupUI() {
        self.nextButton.layer.cornerRadius = nextButton.frame.height / 2
        updateValueLabel()
    }
    
    func updateValueLabel(){
        if ONBOARDDATAMANAGER.typeDocument == .businessCertificate, let response = ONBOARDDATAMANAGER.ekybResponse as? VerifyDocumentResponseModel<BusinessInfoResponseModel>{
            guard let data = response.data else {return}
            ONBOARDDATAMANAGER.taxCode = data.taxCode?.value ?? ""
            titleLabel.text = "ĐĂNG KÝ KINH DOANH - DOANH NGHIỆP"
            documentTypeValueLbl.text = data.textType?.value
            taxCodeValueLbl.text = data.taxCode?.value
            bussinessNameValueLbl.text = data.name?.value
            phoneNumberValueLbl.text = data.phoneNumber?.value
            addressValueLbl.text = data.companyAddress?.value
            placeOfIssueValueLbl.text = data.placeOfIssue?.value
            signerValueLbl.text = data.signer?.value
            documentNumberValueLbl.text = data.representatives?[0].id?.value
            representativeNameValueLbl.text = data.representatives?[0].name?.value
            dateOfIssueValueLbl.text = data.representatives?[0].documentIssueDate?.value
            addressOfTheRepresentativeValueLbl.text = data.representatives?[0].address?.value
        }else if ONBOARDDATAMANAGER.typeDocument == .branchRegistrationCertificate, let response = ONBOARDDATAMANAGER.ekybResponse as? VerifyDocumentResponseModel<BranchInfoResponseModel>{
            guard let data = response.data else {return}
            ONBOARDDATAMANAGER.taxCode = data.taxCode?.value ?? ""
            titleLabel.text = "ĐĂNG KÝ KINH DOANH - \(data.registerActivity?.value ?? "")"
            documentTypeValueLbl.text = "GIẤY CHỨNG NHẬN ĐĂNG KÝ \(data.registerActivity?.value ?? "")"
            taxCodeValueLbl.text = data.taxCode?.value
            bussinessNameValueLbl.text = data.branchNameVietnamese?.value
            phoneNumberValueLbl.text = " "
            addressValueLbl.text = data.companyAddress?.value
            placeOfIssueValueLbl.text = data.placeOfIssue?.value
            signerValueLbl.text = data.signer?.value
            documentNumberValueLbl.text = data.leader?.id?.value
            representativeNameValueLbl.text = data.leader?.name?.value
            dateOfIssueValueLbl.text = data.leader?.documentIssueDate?.value
            addressOfTheRepresentativeValueLbl.text = data.leader?.permanentResidence?.value
        }else if ONBOARDDATAMANAGER.typeDocument == .businessHousehold, let response = ONBOARDDATAMANAGER.ekybResponse as? VerifyDocumentResponseModel<BusinessHouseholdResponseModel>{
            guard let data = response.data else {return}
            ONBOARDDATAMANAGER.taxCode = data.representative?.id?.value ?? ""
            titleLabel.text = "ĐĂNG KÝ KINH DOANH - \(data.businessHouseholdRegistration?.value ?? "")"
            documentTypeValueLbl.text = "GIẤY CHỨNG NHẬN ĐĂNG KÝ \(data.businessHouseholdRegistration?.value ?? "")"
            taxCodeValueLbl.text = " "
            bussinessNameValueLbl.text = data.businessHouseholdName?.value
            phoneNumberValueLbl.text = data.phoneNumber?.value
            addressValueLbl.text = data.businessLocation?.value
            placeOfIssueValueLbl.text = data.placeOfIssue?.value
            signerValueLbl.text = data.signer?.value
            documentNumberValueLbl.text = data.representative?.id?.value
            representativeNameValueLbl.text = data.representative?.name?.value
            dateOfIssueValueLbl.text = data.representative?.documentIssueDate?.value
            addressOfTheRepresentativeValueLbl.text = data.representative?.permanentResidence?.value
        }
    }
    
    // --------------------------------------
    // MARK: Overried
    // --------------------------------------
    
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

    
    //MARK: - Actions
    @IBAction func nextButtonAction(_ sender: Any) {
        let ocrVC = OCRCaptureViewController()
        navigationController?.pushViewController(ocrVC, animated: true)
    }
}
