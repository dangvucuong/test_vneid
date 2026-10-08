//
//  GtinVerifyViewController.swift
//  xverifydemoapp
//
//  Created by Creative Infoway on 18/09/2024.
//

import UIKit
import ImageSlideshow

class GtinVerifyViewController: ChildViewController {
    
    public var gtinNumber: String?
    
    @IBOutlet weak var addressLocalityView: UIView!
    @IBOutlet weak var addressStreetView: UIView!
    @IBOutlet weak var addressStreetLine2View: UIView!
    @IBOutlet weak var countryView: UIView!
    @IBOutlet weak var createdDateView: UIView!
    @IBOutlet weak var updatedDateView: UIView!
    @IBOutlet weak var glnView: UIView!
    @IBOutlet weak var licenseKeyView: UIView!
    @IBOutlet weak var licenseNameView: UIView!
    @IBOutlet weak var licenseTypeView: UIView!
    @IBOutlet weak var licenseMoView: UIView!

    @IBOutlet weak var addressLocalityLbl: UILabel!
    @IBOutlet weak var addressStreetLbl: UILabel!
    @IBOutlet weak var addressStreetLine2Lbl: UILabel!
    @IBOutlet weak var countryLbl: UILabel!
    @IBOutlet weak var createdDateLbl: UILabel!
    @IBOutlet weak var updatedDateLbl: UILabel!
    @IBOutlet weak var glnLbl: UILabel!
    @IBOutlet weak var licenseKeyLbl: UILabel!
    @IBOutlet weak var licenseNameLbl: UILabel!
    @IBOutlet weak var licenseTypeLbl: UILabel!
    @IBOutlet weak var licenseMoLbl: UILabel!
    
    @IBOutlet weak var barCodeImage: UIImageView!
    @IBOutlet weak var barCodeView: UIView!
    
    @IBOutlet weak var gtinLbl: UILabel!
    @IBOutlet weak var statusLbl: UILabel!
    @IBOutlet weak var statusContainer: UIView!
    @IBOutlet weak var headerView: UIView!
    
    
    // --------------------------------------
    // MARK: Overried
    // --------------------------------------

    override func viewDidLoad() {
        super.viewDidLoad()
        setLogoImage(UIImage(named: "ic_header_logo"))
        statusContainer.layer.cornerRadius = 15
        statusContainer.layer.masksToBounds = true
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        requestGtinVerification()
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
    
    func generateBarcode(from string: String) -> UIImage? {
        // Create a data object from the input string
        let data = string.data(using: .ascii)

        // Create a CIFilter for Code128 barcode generation
        if let filter = CIFilter(name: "CICode128BarcodeGenerator") {
            filter.setValue(data, forKey: "inputMessage")
            
            // You can adjust the quiet space (the margin) around the barcode
            filter.setValue(7.00, forKey: "inputQuietSpace")

            // Generate the barcode image
            if let outputImage = filter.outputImage {
                // Scale the barcode to a readable size
                let scaleX = 300 / outputImage.extent.size.width
                let scaleY = 150 / outputImage.extent.size.height
                let transformedImage = outputImage.transformed(by: CGAffineTransform(scaleX: scaleX, y: scaleY))

                // Convert CIImage to UIImage
                return UIImage(ciImage: transformedImage)
            }
        }
        return nil
    }
    
    // Function to check if a string is a valid JSON and return JSON object
    func isValidJSONString(_ jsonString: String) -> Bool {
        if let jsonData = jsonString.data(using: .utf8) {
            do {
                // Try to deserialize the JSON
                let jsonObject = try JSONSerialization.jsonObject(with: jsonData, options: [])
                // Check if it's a valid Dictionary or Array (valid JSON structures)
                if jsonObject is [String: Any] || jsonObject is [Any] {
                    return true
                }
            } catch {
                print("Invalid JSON: \(error.localizedDescription)")
            }
        }
        return false
    }

    // Function to convert JSON string to JSON object (Dictionary or Array)
    func convertJSONStringToObject(_ jsonString: String) -> String {
        if let jsonData = jsonString.data(using: .utf8) {
            do {
                let jsonObject = try JSONSerialization.jsonObject(with: jsonData, options: [])
                if let jsonDict = jsonObject as? [String: Any] {
                    return jsonDict["value"] as? String ?? ""
                } else if let jsonArray = jsonObject as? [Any] {
                    return jsonString
                }
            } catch {
                return jsonString
            }
        }
        return jsonString
    }
    
    private func setupData(data: GtinVerifyResponseModel) {
        if let response = data.responds {
            headerView.isHidden = false
           
            statusLbl.text = response.status == "verified" ? "GS1 Verified" : "GS1 Not Verified"
            statusContainer.backgroundColor = response.status == "verified" ? ColorBrand.verifyGreen : .red
        
            if let product = response.product {
                gtinLbl.text = String(product.gtin)
                barCodeView.isHidden = false
                barCodeImage.image = generateBarcode(from: "\(product.gtin)")
            }
            
            if let model = response.gs1License {
                if let locality = model.addressLocality, !locality.isEmpty {
                    addressLocalityView.isHidden = false
                    if isValidJSONString(locality) {
                        addressLocalityLbl.text = convertJSONStringToObject(locality)
                    } else {
                        addressLocalityLbl.text = locality
                    }
                } else {
                    addressLocalityView.isHidden = true
                }
                
                if let addressStreet = model.addressStreet, !addressStreet.isEmpty {
                    addressStreetView.isHidden = false
                    if isValidJSONString(addressStreet) {
                        addressStreetLbl.text = convertJSONStringToObject(addressStreet)
                    } else {
                        addressStreetLbl.text = addressStreet
                    }
                    
                } else {
                    addressStreetView.isHidden = true
                }
                
                if let streetTow = model.addressStreetLine2, !streetTow.isEmpty {
                    addressStreetLine2View.isHidden = false
                    if isValidJSONString(streetTow) {
                        addressStreetLine2Lbl.text = convertJSONStringToObject(streetTow)
                    } else {
                        addressStreetLine2Lbl.text = streetTow
                    }
                } else {
                    addressStreetLine2View.isHidden = true
                }
                
                if let country = model.countryCode, !country.isEmpty {
                    countryView.isHidden = false
                    countryLbl.text = country
                } else {
                    countryView.isHidden = true
                }
                
                if let gln = model.licenseGln, !gln.isEmpty {
                    glnView.isHidden = false
                    glnLbl.text = gln
                } else {
                    glnView.isHidden = true
                }
                
                if let key = model.licenseKey, !key.isEmpty {
                    licenseKeyView.isHidden = false
                    licenseKeyLbl.text = key
                } else {
                    licenseKeyView.isHidden = true
                }
                
                if let name = model.licenseName, !name.isEmpty {
                    licenseNameView.isHidden = false
                    licenseNameLbl.text = name
                } else {
                    licenseNameView.isHidden = true
                }
                
                if let type = model.licenseType, !type.isEmpty {
                    licenseTypeView.isHidden = false
                    licenseTypeLbl.text = type
                } else {
                    licenseTypeView.isHidden = true
                }
                
                if let mo = model.licensingMo, !mo.isEmpty {
                    licenseMoView.isHidden = false
                    licenseMoLbl.text = mo
                } else {
                    licenseMoView.isHidden = true
                }
                
                
                createdDateView.isHidden = false
                createdDateLbl.text = "\(model.dateCreated)"
                updatedDateView.isHidden = false
                updatedDateLbl.text = "\(model.dateUpdated)"
                
            }
        }
    }
    
    // --------------------------------------
    // MARK: Services
    // --------------------------------------
    
    private func requestGtinVerification() {
        guard let gtin = gtinNumber else {
            return
        }
        showActivity()
        APISERVICE.verifyGtin(gtin: gtin) { result in
            self.hideActivity()
            switch result {
            case .success(let model):
                let data = model
                self.setupData(data: model);
            case .failure(let error):
                self.alert(title: "Error", message: error.localizedDescription) { _ in
                    self.navigationController?.popViewController(animated: true)
                }
            }
        }
    }

}
