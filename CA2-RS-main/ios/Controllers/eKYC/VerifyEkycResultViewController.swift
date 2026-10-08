//
//  VerifyEkycResultViewController.swift
//  xverifydemoapp
//
//  Created by Minh Tri on 02/12/2023.
//

import UIKit
import Lottie

class VerifyEkycResultViewController: NavigationBarViewController {

    @IBOutlet weak var nextButton: UIButton!
    @IBOutlet weak var imageContainerView: UIView!
    @IBOutlet weak var infoContainerView: UIView!
    @IBOutlet weak var titleLabel: UILabel!
    
    @IBOutlet weak var mainIcon: UIImageView!
    @IBOutlet weak var eidFaceImageView: UIImageView!
    @IBOutlet weak var capturedFaceImageView: UIImageView!
    
    // Personal Information
    @IBOutlet weak var personalInfomationLbl: UILabel!
    @IBOutlet weak var documentNumberLbl: UILabel!
    @IBOutlet weak var documentNumberValueLbl: UILabel!
    @IBOutlet weak var fullNameLbl: UILabel!
    @IBOutlet weak var fullNameValueLbl: UILabel!
    @IBOutlet weak var dateOfBirthLbl: UILabel!
    @IBOutlet weak var dateOfBirthValueLbl: UILabel!
    @IBOutlet weak var genderLbl: UILabel!
    @IBOutlet weak var genderValueLbl: UILabel!
    @IBOutlet weak var placeOfResidenceLbl: UILabel!
    @IBOutlet weak var placeOfResidenceValueLbl: UILabel!
    @IBOutlet weak var asystemLbl: UILabel!
    @IBOutlet weak var asystemImageView: UIImageView!
    @IBOutlet weak var verifyIdLbl: UILabel!
    @IBOutlet weak var verifyIdImageView: UIImageView!
    @IBOutlet weak var faceMatchingLbl: UILabel!
    @IBOutlet weak var faceMatchingImageView: UIImageView!
    @IBOutlet weak var chipPhotoLbl: UILabel!
    @IBOutlet weak var currentPhotoLbl: UILabel!
    
    var verifyFaceMatch: Bool = false
    var isValidIdCard: Bool = false
    var isVerifySuccess: Bool = false
    var isSegmentChild: Bool = false
    var capturedFacePath: String = ""
    //contrainst for layout as segment child view
    //top scrollView
    @IBOutlet weak var topScrollViewToLabel: NSLayoutConstraint!
    @IBOutlet weak var topScrollViewToSafeArea: NSLayoutConstraint!
    //botomScrollView
    @IBOutlet weak var bottomScrollViewToButton: NSLayoutConstraint!
    @IBOutlet weak var bottomScrollViewToSafeArea: NSLayoutConstraint!
    
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
        return nil
    }
    
    // --------------------------------------
    // MARK: Overried
    // --------------------------------------
    override func setupUI() {
        
        if isSegmentChild {
            nextButton.isHidden = true
            titleLabel.isHidden = true
            
            topScrollViewToLabel.isActive = false
            topScrollViewToSafeArea.constant = 16
            bottomScrollViewToButton.isActive = false
            bottomScrollViewToSafeArea.constant = 0
            
            topScrollViewToSafeArea.priority = .defaultHigh
            topScrollViewToSafeArea.priority = .defaultHigh
            self.view.layoutIfNeeded()
        }
        
        self.nextButton.layer.cornerRadius = self.nextButton.frame.height / 2
        self.personalInfomationLbl.text = LOCALIZED("personal_information")
        self.documentNumberLbl.text = LOCALIZED("label_eid_number:")
        self.fullNameLbl.text = LOCALIZED("label_name:")
        self.dateOfBirthLbl.text = LOCALIZED("label_date_of_birth:")
        self.genderLbl.text = LOCALIZED("label_gender:")
        self.placeOfResidenceLbl.text = LOCALIZED("label_place_of_residence:")
        self.asystemLbl.text = LOCALIZED("label_asystem")
        self.verifyIdLbl.text = LOCALIZED("label_verify_id")
        self.faceMatchingLbl.text = LOCALIZED("label_face_matching")
        self.chipPhotoLbl.text = LOCALIZED("chip_photo")
        self.currentPhotoLbl.text = LOCALIZED("current_photo")
        
        self.documentNumberValueLbl.text = ""
        self.fullNameValueLbl.text = ""
        self.dateOfBirthValueLbl.text = ""
        self.genderValueLbl.text = ""
        self.placeOfResidenceValueLbl.text = ""
        
        self.imageContainerView.layer.cornerRadius = 10.0
        self.infoContainerView.layer.cornerRadius = 10.0
        
        guard let eid = ONBOARDDATAMANAGER.eid else {return}
        let chipAuthSuccess = eid.chipAuthenticationStatus == .success
        let passiveAuthSuccess = eid.passiveAuthenticationStatus == .success
        let activeAuthSuccess = eid.activeAuthenticationStatus == .success
        let asystemSuccess = chipAuthSuccess && passiveAuthSuccess && activeAuthSuccess
        
        isVerifySuccess = verifyFaceMatch && isValidIdCard && asystemSuccess
        
        self.titleLabel.text = isVerifySuccess ? LOCALIZED("verify_success").uppercased() : LOCALIZED("verify_fail_title").uppercased()
        
        self.asystemImageView.image = asystemSuccess ? UIImage(named: "icon_success") : UIImage(named: "icon_fail")
        self.verifyIdImageView.image = isValidIdCard ? UIImage(named: "icon_success") : UIImage(named: "icon_fail")
        self.faceMatchingImageView.image = verifyFaceMatch ? UIImage(named: "icon_success") : UIImage(named: "icon_fail")
        
        
        self.mainIcon.image = isVerifySuccess ? UIImage(named:"icon_success") : UIImage(named:"icon_fail")
        
        self.nextButton.setTitle(isVerifySuccess ? LOCALIZED("done_button").uppercased() : LOCALIZED("try_again_button").uppercased(), for: .normal)
        self.nextButton.backgroundColor = isVerifySuccess ? ColorBrand.appColorGreen : ColorBrand.appColorRed
        let userdefault = UserDefaults.standard
        if (isVerifySuccess) {
          userdefault.set("true", forKey: "isValidIdCard")
          userdefault.set("true", forKey: "faceMatching")
          userdefault.set("true", forKey: "verifyID")
          userdefault.set("1", forKey: "EKYC_done")
        } else {
          userdefault.set("0", forKey: "EKYC_done")
        }
        self.capturedFaceImageView.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(handleOpenCaptured)))
        self.eidFaceImageView.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(handleOpenEid)))
        self.capturedFaceImageView.isUserInteractionEnabled = true
        self.eidFaceImageView.isUserInteractionEnabled = true
        self.updatePersonalInformation()


    }
    
    private func updatePersonalInformation() {
        guard let eid = ONBOARDDATAMANAGER.eid else {return}
        guard let personDetail = eid.personOptionalDetails else {return}
        
        self.documentNumberValueLbl.text = personDetail.eidNumber
        self.fullNameValueLbl.text = personDetail.fullName
        self.dateOfBirthValueLbl.text = personDetail.dateOfBirth
        self.genderValueLbl.text = personDetail.gender
        self.placeOfResidenceValueLbl.text = personDetail.placeOfResidence
        self.placeOfResidenceValueLbl.sizeToFit()
        self.eidFaceImageView.image = eid.faceImage
        self.eidFaceImageView.layer.cornerRadius = 10
        
        let userdefault = UserDefaults.standard
        let obj=PersonDetails()
       
        obj.eidNumber=personDetail.eidNumber ?? ""
        obj.fullName=personDetail.fullName ?? ""
        obj.dateOfBirth=personDetail.dateOfBirth ?? ""
        obj.gender=personDetail.gender ?? ""
        obj.nationality=personDetail.nationality ?? ""
        obj.ethnicity=personDetail.ethnicity ?? ""
        obj.religion=personDetail.religion ?? ""
        obj.placeOfOrigin=personDetail.placeOfOrigin ?? ""
        obj.placeOfResidence=personDetail.placeOfResidence ?? ""
        obj.dateOfIssue=personDetail.dateOfIssue ?? ""
        obj.dateOfExpiry=personDetail.dateOfExpiry ?? ""
        obj.fatherName=personDetail.fatherName ?? ""
        obj.motherName=personDetail.motherName ?? ""
        obj.spouseName=personDetail.spouseName ?? ""
                       
        
        let jsonEncoder = JSONEncoder()
        let jsonData = try! jsonEncoder.encode(obj)
        let json = String(data: jsonData, encoding: String.Encoding.utf8)
        userdefault.set(json, forKey: "card_info")
        
      userdefault.set(convertImageToBase64String(img: eid.faceImage!), forKey: "img_chip")
        if let faceURlImage = URL(string: capturedFacePath) {
            do {
                let imageData = try Data(contentsOf: faceURlImage)
              let strBase64 = imageData.base64EncodedString(options: .lineLength64Characters)
              userdefault.set(strBase64, forKey: "img_capture")

                var imageContent = UIImage()
                imageContent = UIImage(data: imageData) ?? UIImage()
                self.capturedFaceImageView.image = imageContent
                self.capturedFaceImageView.layer.cornerRadius = 10
            } catch {
                print("Error loading image : \(error)")
            }
        }
            self.capturedFaceImageView.contentMode = .scaleAspectFill
            self.eidFaceImageView.contentMode = .scaleAspectFill
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
    // MARK: Event
    // --------------------------------------
    @IBAction func nextButtonAction(_ sender: UIButton) {
       // APPDELEGATE.setupRootController(INIT_CONTROLLER_XIB(LandingViewController.self), false)
      UIApplication.shared.keyWindow?.rootViewController?.dismiss(animated: true, completion: nil)
    }
    
    @objc func handleOpenCaptured(_ sender: UITapGestureRecognizer) {
        popUpFullImage(capturedFacePath)
    }
    
    @objc func handleOpenEid(_ sender: UITapGestureRecognizer) {
        popUpFullImage(ONBOARDDATAMANAGER.eidFacePath)
    }
  func convertImageToBase64String (img: UIImage) -> String {
      return img.jpegData(compressionQuality: 1)?.base64EncodedString() ?? ""
  }
}
class PersonDetails: Encodable {
    var eidNumber: String = ""
  var fullName: String = ""
  var dateOfBirth: String = ""
  var gender: String = ""
  var nationality: String = ""
  var ethnicity: String = ""
  var religion: String = ""
  var placeOfOrigin: String = ""
  var placeOfResidence: String = ""
  var personalIdentification: String = ""
  var dateOfIssue: String = ""
  var dateOfExpiry: String = ""
  var fatherName: String = ""
  var motherName: String = ""
  var spouseName: String = ""
}
