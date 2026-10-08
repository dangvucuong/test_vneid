//
//  TransferSuccessViewController.swift
//  xverifydemoapp
//
//  Created by Huynh Minh Hieu on 16/03/2024.
//

import UIKit

class TransferSuccessViewController: NavigationBarViewController {
    @IBOutlet weak var faceIdImageView: UIImageView!
    @IBOutlet weak var capturedImageView: UIImageView!
    @IBOutlet weak var liveImageView: UIImageView!
    
    @IBOutlet weak var backToMenuButton: UIButton!
    
    @IBOutlet weak var timeLabel: UILabel!
    @IBOutlet weak var successfulTransactionLbl: UILabel!
    @IBOutlet weak var writtenAmountLbl: UILabel!
    @IBOutlet weak var transactionInfomationLbl: UILabel!
    @IBOutlet weak var beneficiaryAccountLbl: UILabel!
    @IBOutlet weak var beneficiaryNameLbl: UILabel!
    @IBOutlet weak var transactionCodeLbl: UILabel!
    @IBOutlet weak var bankLbl: UILabel!
    @IBOutlet weak var amountLbl: UILabel!
    @IBOutlet weak var transactionDescriptionLbl: UILabel!
    @IBOutlet weak var chipPhotoLbl: UILabel!
    @IBOutlet weak var onboardPhotoLbl: UILabel!
    @IBOutlet weak var currentPhotoLbl: UILabel!
    
    @IBOutlet weak var transferResult: UILabel!
    
    @IBOutlet weak var mainTitleMoney: UILabel!
    @IBOutlet weak var subTitleMoney: UIButton!
    
    public var liveImagePath: String = ""
    public var transferType: TransferType = .TypeC
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
    }
    
    override func setupUI() {
        setupLeftNavigationBarItem()
        liveImagePath = ONBOARDDATAMANAGER.currentOnboardFace
        
        transferResult.font = UIFont(name: "GoogleSans-Bold", size: 18.0)
        transferResult.text = ONBOARDDATAMANAGER.transactionStatus == .BIOMETRIC_VERIFIED ? LOCALIZED("transfer_success").uppercased() : LOCALIZED("transfer_fail").uppercased()
        transferResult.textColor = ONBOARDDATAMANAGER.transactionStatus == .BIOMETRIC_VERIFIED ? ColorBrand.appColorWhite : ColorBrand.appColorRed
        successfulTransactionLbl.text = LOCALIZED("successful_transaction").uppercased()
        writtenAmountLbl.text = LOCALIZED("written_amount")
        transactionInfomationLbl.text = LOCALIZED("transaction_information")
        beneficiaryAccountLbl.text = LOCALIZED("beneficiary_account")
        beneficiaryNameLbl.text = LOCALIZED("beneficiary_name")
        transactionCodeLbl.text = LOCALIZED("transaction_code")
        bankLbl.text = LOCALIZED("bank")
        amountLbl.text = LOCALIZED("amount")
        transactionDescriptionLbl.text = LOCALIZED("transaction_description")
        chipPhotoLbl.text = LOCALIZED("chip_photo")
        onboardPhotoLbl.text = LOCALIZED("onboard_photo")
        currentPhotoLbl.text = LOCALIZED("current_photo")
        backToMenuButton.setTitle(LOCALIZED("home").uppercased(), for: .normal)
        backToMenuButton.layer.cornerRadius = backToMenuButton.frame.height/2
        timeLabel.text = Date().addingTimeInterval(TimeInterval(TimeZone.current.secondsFromGMT())).toString(.custom("HH:mm - dd/MM/yyyy"))
        setupImageView(faceIdImageView, imagePath: ONBOARDDATAMANAGER.bioEidChipImagePath ?? "")
        setupImageView(capturedImageView, imagePath: ONBOARDDATAMANAGER.bioImageOnboard ?? "")
        setupImageView(liveImageView, imagePath: liveImagePath,shouldCropImage: false)
        
        let money = self.transferType == .TypeC ? "500,000 VND" : "50,000,000 VND"
        let textMoney = self.transferType == .TypeC ? LOCALIZED("money_500k") : LOCALIZED("money_50m")
        
        mainTitleMoney.text = money
        subTitleMoney.setTitle(money, for: .normal)
        writtenAmountLbl.text = textMoney
    }
    
    
    private func cropImage(_ sourceImage: UIImage) -> CGImage? {
        // Determines the x,y coordinate of a centered
        // sideLength by sideLength square
        let cropOffset = 45
        
        let sourceSize = sourceImage.size
        let xOffset = cropOffset
        let yOffset = cropOffset

        // The cropRect is the rect of the image to keep,
        // in this case centered
        let cropRect = CGRect(
            x: xOffset,
            y: yOffset,
            width: Int(sourceImage.size.width) - (cropOffset * 2),
            height: Int(sourceImage.size.height) - (cropOffset * 2)
        ).integral

        // Center crop the image
        guard let sourceCGImage = sourceImage.cgImage else { return nil }
        if let croppedCGImage = sourceCGImage.cropping(
            to: cropRect
        ) {
            return croppedCGImage
        }
        
        return nil
    }
    
    private func setupImageView(_ imageView: UIImageView, imagePath: String, shouldCropImage: Bool = false) {
        if let uriImage = URL(string: imagePath) {
            do {
                let imageData = try Data(contentsOf: uriImage)
                let image = UIImage(data: imageData)
                var imageContent = UIImage()
                if shouldCropImage ,let image = image, let cropCGImage = self.cropImage(image) {
                    imageContent = UIImage(cgImage: cropCGImage, scale: image.imageRendererFormat.scale,
                        orientation: image.imageOrientation)
                } else if let image = image {
                    // in case image no need to crop, return the original image
                    imageContent = image
                }
                
                imageView.contentMode = .scaleAspectFill
                imageView.clipsToBounds = true
                
                imageView.image = imageContent
                imageView.layer.cornerRadius = 10
            } catch {
                print("Error loading image : \(error)")
            }
        }
    }
    
    private func setupImageView(_ imageView: UIImageView, image: UIImage?) {
        if let image = image {
                imageView.contentMode = .scaleAspectFill
                imageView.clipsToBounds = true
                
                imageView.image = image
                imageView.layer.cornerRadius = 10
        }
    }
    
    private func setupLeftNavigationBarItem() {
        let button = CustomButton.init( CGRect(x: 0, y: 0, width: 0, height: 0))
        button.backgroundColor = .clear
        button.tintColor = .clear
        navigationItem.leftBarButtonItem = UIBarButtonItem(customView: button)
    }
    
    @IBAction func backToMenuButtonAction(_ sender: Any) {
        self.navigationController?.popToRootViewController(animated: true)
    }
    
}
