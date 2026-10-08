//
//  EkybMatchingViewController.swift
//  xverifydemoapp
//
//  Created by Nguyễn Hiếu on 17/2/25.
//

import UIKit

class EkybMatchingViewController: NavigationBarViewController {
    
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
    
    @IBOutlet weak var verifyIdImageView: UIImageView!
    @IBOutlet weak var verifyFaceMatchingImageView: UIImageView!
    @IBOutlet weak var verifyTaxCodeImageView: UIImageView!
    @IBOutlet weak var verifyRepresentativeImageView: UIImageView!
    public var taxCodeInfomation: TaxcodeVerifyInfoResponseModel<TaxcodeVerifyAdvanceResponseModel>?
    public var verifyFaceMatch: Bool = false
    
    override func viewDidLoad() {
        super.viewDidLoad()

    }
    
    override var leftBarButton: UIButton? {
        return nil
    }
    
    // --------------------------------------
    // MARK: Overried
    // --------------------------------------
    
    override func setupUI(){
        guard let eid = ONBOARDDATAMANAGER.eid else {return}
        
        self.taxCodeInfomation = ONBOARDDATAMANAGER.taxCodeInfomation
        
        let verifyTaxCodeSuccess = (taxCodeInfomation?.isValid)! && taxCodeInfomation?.responds?.status == "verified"
        let verifyRepresentative = taxCodeInfomation?.responds?.company?.representativeID == eid.personOptionalDetails?.eidNumber
        
        self.verifyIdImageView.image = eid.agencySignatureChecksum ? UIImage(named: "icon_success") : UIImage(named: "icon_fail")
        self.verifyFaceMatchingImageView.image = verifyFaceMatch ? UIImage(named: "icon_success") : UIImage(named: "icon_fail")
        self.verifyTaxCodeImageView.image = verifyTaxCodeSuccess ? UIImage(named: "icon_success") : UIImage(named: "icon_fail")
        self.verifyRepresentativeImageView.image = verifyRepresentative ? UIImage(named: "icon_success") : UIImage(named: "icon_fail")
        if eid.agencySignatureChecksum && verifyFaceMatch && verifyTaxCodeSuccess && verifyRepresentative{
            titleLabel.text = LOCALIZED("verify_success").uppercased()
        }else{
            titleLabel.text = LOCALIZED("verify_fail_title").uppercased()
        }
        updatePersonalInfomation()
    }
    
    private func updatePersonalInfomation(){
        if ONBOARDDATAMANAGER.typeDocument == .businessCertificate, let response = ONBOARDDATAMANAGER.ekybResponse as? VerifyDocumentResponseModel<BusinessInfoResponseModel>{
            guard let data = response.data else {return}
            ONBOARDDATAMANAGER.taxCode = data.taxCode?.value ?? ""
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
            documentTypeValueLbl.text = LOCALIZED("certificate_of_registration") + "\(data.registerActivity?.value ?? "")"
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
            documentTypeValueLbl.text = LOCALIZED("certificate_of_registration") + "\(data.businessHouseholdRegistration?.value ?? "")"
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
}
