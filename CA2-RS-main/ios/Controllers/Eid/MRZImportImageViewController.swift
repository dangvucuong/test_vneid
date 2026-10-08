//
//  MRZImportImageViewController.swift
//  xverifydemoapp
//
//  Created by Huynh Minh Hieu on 11/03/2024.
//

import UIKit
import AVFoundation
import CoreVideo

class MRZImportImageViewController: ChildViewController {
    
    @IBOutlet weak var pickedImageView: UIImageView!
    @IBOutlet weak var importImageView: UIImageView!
    @IBOutlet weak var takePictureButton: UIButton!
    @IBOutlet weak var accessLibButton: UIButton!
    @IBOutlet weak var continueButton: UIButton!
    @IBOutlet weak var cardPlaceHoldderImgView: UIImageView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
    }
    
    override func setupUI() {
        pickedImageView.layer.cornerRadius = kCornerRadius
        takePictureButton.layer.cornerRadius = takePictureButton.frame.height/2
        accessLibButton.layer.cornerRadius = accessLibButton.frame.height/2
        continueButton.layer.cornerRadius = continueButton.frame.height/2
        setLogoImage(UIImage(named: "ic_header_logo"))
    }
    

    
    @IBAction func takePictureButtonAction(_ sender: Any) {
        let cameraVc = UIImagePickerController()
        cameraVc.sourceType = UIImagePickerController.SourceType.camera
        cameraVc.cameraCaptureMode = .photo
        cameraVc.cameraDevice = .rear
        cameraVc.delegate = self
        DISPATCH_ASYNC_MAIN {
            self.present(cameraVc, animated: true, completion: nil)
        }
    
    }
    
    
    @IBAction func accessLibButtonAction(_ sender: Any) {
        let cameraVc = UIImagePickerController()
        cameraVc.sourceType = UIImagePickerController.SourceType.photoLibrary
        cameraVc.delegate = self
        DISPATCH_ASYNC_MAIN {
            self.present(cameraVc, animated: true, completion: nil)
        }
    }
    
    
    @IBAction func continueButtonAction(_ sender: Any) {
        guard let image =  pickedImageView.image else {
            return
        }
        self.proccessMRZ(image: image)
    }
    
    
    private func proccessMRZ(image: UIImage) {
        EIDFACADE.processMrz(image: image) { [weak self] mrzInfo in
            guard let self = self else {return}
            guard let info = mrzInfo else {
                DISPATCH_ASYNC_MAIN {
                    Graphics.showMessage(.error, body: LOCALIZED("eid_read_fail"))
                }
                return
            }
            DISPATCH_ASYNC_MAIN {
                ONBOARDDATAMANAGER.mrzInfo = info
                ONBOARDDATAMANAGER.mrzKey = try! EIDFACADE.buildMrzKey(eidNumber: info.documentNumber, dateOfBirth: info.dateOfBirth, dateOfExpiry: info.dateOfExpiry) ?? ""
                
                self.navigateToNFCScan()
            }
        }  errorHandler: { error in
            Log.error(error?.localizedDescription ?? "")
        }
    }
    
    private func navigateToNFCScan() {
        let controller = INIT_CONTROLLER_XIB(MRZScannerViewController.self)
        controller.isNFCOnly = true
        self.navigationController?.pushViewController(controller, animated: true)
    }
}

extension MRZImportImageViewController: UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
        
        guard let image = info[.originalImage] as? UIImage else {
            print("====== NO IMAGE =====")
            return
        } 
        pickedImageView.contentMode = .scaleAspectFill
        DISPATCH_ASYNC_MAIN {
            self.pickedImageView.image = image
            picker.dismiss(animated: true)
            self.cardPlaceHoldderImgView.isHidden = true
        }

        print("\(image)")
    }
}
