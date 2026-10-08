//
//  OCRSegmentViewController.swift
//  xverifydemoapp
//
//  Created by Huynh Minh Hieu on 21/03/2024.
//

import UIKit
import HMSegmentedControl
import SnapKit

class OCRSegmentViewController:
    NavigationBarViewController {
    
    @IBOutlet weak var topView: UIView!
    @IBOutlet weak var contentView: UIView!
    public var verifyFaceMatch: Bool = false
    public var isValidIdCard: Bool = false
    public var isVerifySuccess: Bool = false
    var capturedFacePath: String = ""
    
    @IBOutlet weak var doneButton: UIButton!
    var segmentedControl: HMSegmentedControl?
    var selectedSegmentedIdx: Int = 0
    
    private var ekybView: EkybMatchingViewController {
        let controller = INIT_CONTROLLER_XIB(EkybMatchingViewController.self)
        controller.verifyFaceMatch = verifyFaceMatch
        return controller
    }
    
    private var ocrView: OCRMatchingViewController {
        let controller = INIT_CONTROLLER_XIB(OCRMatchingViewController.self)
        return controller
    }
    
    private var eidView: VerifyEidSuccessViewController {
        let controller = INIT_CONTROLLER_XIB(VerifyEidSuccessViewController.self)
        controller.isSegmentChild = true
        return controller
    }
    
    private var ekycView: VerifyEkycResultViewController {
        let controller = INIT_CONTROLLER_XIB(VerifyEkycResultViewController.self)
        controller.isSegmentChild = true
        controller.isValidIdCard = isValidIdCard
        controller.verifyFaceMatch = verifyFaceMatch
        controller.capturedFacePath = capturedFacePath
        return controller
    }
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    override func handleLeftBarButtonEvent() {
        
    }
    
    override func setupUI() {
        super.setupUI()
        setupLeftNavigationBarItem()
        doneButton.layer.cornerRadius = doneButton.frame.height/2
        doneButton.setTitle(LOCALIZED("done_button").uppercased(), for: .normal)
        setLogoImage(UIImage(named: "ic_header_logo"))
        
        if ONBOARDDATAMANAGER.businessType == .ocr{
            buildSegmentedControl(self.topView, ["OCR","CCCD Chip","eKYC"])
        }else if ONBOARDDATAMANAGER.businessType == .ekyb{
            buildSegmentedControl(self.topView, ["eKYB","OCR","CCCD Chip","eKYC"])
        }
        self.topView.borders(for: [.bottom],width: 0.5, color: ColorBrand.appColorGreen)
        if ONBOARDDATAMANAGER.businessType == .ocr{
            self.embed(ocrView)
        }else if ONBOARDDATAMANAGER.businessType == .ekyb{
            self.embed(ekybView)
        }
    }
    
    private func buildSegmentedControl(_ view: UIView, _ titles: [String] = []) {
        if segmentedControl != nil { segmentedControl?.removeFromSuperview() }
        segmentedControl = buildTextSegmentedControl(titles, frame: view.bounds)
        segmentedControl?.setSelectedSegmentIndex(UInt(selectedSegmentedIdx), animated: true)
        segmentedControl?.addTarget(self, action: #selector(handleSegmentValueChangedEvent(_:)), for: .valueChanged)
        guard let segmentedControl = segmentedControl else { return }
        view.addSubview(segmentedControl)
    }
    
    private func setupLeftNavigationBarItem() {
        let button = CustomButton.init( CGRect(x: 0, y: 0, width: 0, height: 0))
        button.backgroundColor = .clear
        button.tintColor = .clear
        navigationItem.leftBarButtonItem = UIBarButtonItem(customView: button)
    }
    
    @objc private func handleSegmentValueChangedEvent(_ segmentedControl: HMSegmentedControl) {
        selectedSegmentedIdx = Int(segmentedControl.selectedSegmentIndex)
        self.contentView.subviews.forEach {$0.removeFromSuperview()}
        DISPATCH_ASYNC_MAIN { [weak self] in
            guard let self = self else {return}
            if ONBOARDDATAMANAGER.businessType == .ocr{
                switch selectedSegmentedIdx{
                case 0:
                    self.embed(ocrView)
                case 1:
                    self.embed(eidView)
                case 2:
                    self.embed(ekycView)
                default:
                    return
                }
            }else if ONBOARDDATAMANAGER.businessType == .ekyb{
                switch selectedSegmentedIdx{
                case 0:
                    self.embed(ekybView)
                case 1:
                    self.embed(ocrView)
                case 2:
                    self.embed(eidView)
                case 3:
                    self.embed(ekycView)
                default:
                    return
                }
            }
        }
    }
    
    func embed(_ viewController:UIViewController) {
        viewController.willMove(toParent: self)
        viewController.view.frame = contentView.bounds
        contentView.addSubview(viewController.view)
        self.addChild(viewController)
        viewController.didMove(toParent: self)
    }
    
    @IBAction func doneButtonAction(_ sender: Any) {
        self.navigationController?.popToRootViewController(animated: true)
    }
}
