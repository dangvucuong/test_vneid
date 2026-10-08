//
//  VerifyEkycResultViewController.swift
//  xverifydemoapp
//
//  Created by Minh Tri on 02/12/2023.
//

import UIKit
import Lottie

class BioVerifyResultViewController: NavigationBarViewController {

    @IBOutlet weak var nextButton: UIButton!
    @IBOutlet weak var imageContainerView: UIView!
    @IBOutlet weak var infoContainerView: UIView!
    @IBOutlet weak var titleLabel: UILabel!
    
    @IBOutlet weak var mainIcon: UIImageView!
    @IBOutlet weak var eidFaceImageView: UIImageView!
    @IBOutlet weak var capturedFaceImageView: UIImageView!
    
    // Personal Information
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
    @IBOutlet weak var verifyRarLbl: UILabel!
    @IBOutlet weak var rarVerifyResult: UIImageView!
    @IBOutlet weak var verifyFaceLbl: UILabel!
    @IBOutlet weak var faceResult: UIImageView!
    @IBOutlet weak var otpVerifyLbl: UILabel!
    @IBOutlet weak var otpResult: UIImageView!
    
    var verifyFaceMatch: Bool = false
    var rarSuccess: Bool = false
    var isVerifySuccess: Bool = false
    var isSegmentChild: Bool = false
    var capturedFacePath: String = ""
    var otpSuccess: Bool = true
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
        
        //load image
        var chipImage: UIImage = UIImage()
        var onboardImage: UIImage = UIImage()
        if let chipImagePath = ONBOARDDATAMANAGER.bioEidChipImagePath {
            if let urlImage = URL(string: chipImagePath) {
                do {
                    let imageData = try Data(contentsOf: urlImage)
                    chipImage = UIImage(data: imageData) ?? UIImage()
                } catch {
                    print("Error loading image : \(error)")
                }
            }
        }
        
        if let onboardImagePath = ONBOARDDATAMANAGER.bioImageOnboard {
            if let urlImage = URL(string: onboardImagePath) {
                do {
                    let imageData = try Data(contentsOf: urlImage)
                    onboardImage = UIImage(data: imageData) ?? UIImage()
                } catch {
                    print("Error loading image : \(error)")
                }
            }
        }
        
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
        
        self.documentNumberLbl.text = LOCALIZED("label_eid_number:")
        self.fullNameLbl.text = LOCALIZED("label_name:")
        self.dateOfBirthLbl.text = LOCALIZED("label_date_of_birth:")
        self.genderLbl.text = LOCALIZED("label_gender:")
        self.placeOfResidenceLbl.text = LOCALIZED("label_place_of_residence:")
        self.verifyRarLbl.text = LOCALIZED("label_verify_rar")
        self.verifyFaceLbl.text = LOCALIZED("label_face_matching")
        self.otpVerifyLbl.text = LOCALIZED("label_otp")
        
        self.documentNumberValueLbl.text = ""
        self.fullNameValueLbl.text = ""
        self.dateOfBirthValueLbl.text = ""
        self.genderValueLbl.text = ""
        self.placeOfResidenceValueLbl.text = ""
        
        self.imageContainerView.layer.cornerRadius = 10.0
        self.infoContainerView.layer.cornerRadius = 10.0
        
        guard let eid = ONBOARDDATAMANAGER.eidBio else {return}
        
        if ONBOARDDATAMANAGER.onboardStatus == .ONBOARD_COMPLETED {
            verifyFaceMatch = true
            rarSuccess = true
        }

        isVerifySuccess = verifyFaceMatch && rarSuccess && otpSuccess
        
        self.titleLabel.text = isVerifySuccess ? LOCALIZED("verify_success").uppercased() : LOCALIZED("verify_fail_title").uppercased()
        
        self.rarVerifyResult.image = rarSuccess ? UIImage(named: "icon_success") : UIImage(named: "icon_fail")
        self.faceResult.image = verifyFaceMatch ? UIImage(named: "icon_success") : UIImage(named: "icon_fail")
        self.otpResult.image = otpSuccess ? UIImage(named: "icon_success") : UIImage(named: "icon_fail")
        
        
        self.mainIcon.image = isVerifySuccess ? UIImage(named:"icon_success") : UIImage(named:"icon_fail")
        
       self.nextButton.setTitle(isVerifySuccess ? LOCALIZED("home_page_button").uppercased() : LOCALIZED("try_again_button").uppercased(), for: .normal)
        self.nextButton.backgroundColor = isVerifySuccess ? ColorBrand.appColorGreen : ColorBrand.appColorRed

        self.capturedFaceImageView.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(handleOpenCaptured)))
        self.eidFaceImageView.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(handleOpenEid)))
        self.capturedFaceImageView.isUserInteractionEnabled = true
        self.eidFaceImageView.isUserInteractionEnabled = true
        self.updatePersonalInformation(chipImage: chipImage, onboardImage: onboardImage)
    }
    
    private func updatePersonalInformation(chipImage: UIImage, onboardImage: UIImage) {
        guard let personDetail = ONBOARDDATAMANAGER.eidBio else {return}
        
        self.documentNumberValueLbl.text = personDetail.idCard
        self.fullNameValueLbl.text = personDetail.fullName
        self.dateOfBirthValueLbl.text = personDetail.dateOfBirth
        self.genderValueLbl.text = personDetail.gender
        self.placeOfResidenceValueLbl.text = personDetail.placeOfResidence
        self.placeOfResidenceValueLbl.sizeToFit()
        self.eidFaceImageView.image = chipImage
        self.eidFaceImageView.layer.cornerRadius = 10
        self.capturedFaceImageView.image = onboardImage
        self.capturedFaceImageView.layer.cornerRadius = 10
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
        self.navigationController?.popToRootViewController(animated: true)
    }
    
    @objc func handleOpenCaptured(_ sender: UITapGestureRecognizer) {
        popUpFullImage(capturedFacePath)
    }
    
    @objc func handleOpenEid(_ sender: UITapGestureRecognizer) {
        popUpFullImage(ONBOARDDATAMANAGER.bioImageOnboard ?? "")
    }
}
