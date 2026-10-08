//
//  VerifyEidMainViewController.swift
//  xverifydemoapp
//
//  Created by Minh Tri on 23/12/2023.
//

import UIKit

class VerifyEidMainViewController: NavigationBarViewController {

    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var introDescription: UILabel!
    @IBOutlet weak var startButton: UIButton!
    
    // --------------------------------------
    // MARK: Life Cycle
    // --------------------------------------
    override func viewDidLoad() {
        super.viewDidLoad()
        setLogoImage(UIImage(named: "ic_header_logo"))
    }


    // --------------------------------------
    // MARK: Overried
    // --------------------------------------
    override func setupUI() {
        titleLabel.text = LOCALIZED("intro_title_eid")
        introDescription.text = LOCALIZED("intro_description_eid")
        startButton.setTitle(LOCALIZED("start_button").uppercased(), for: .normal)
        startButton.layer.cornerRadius = self.startButton.frame.height / 2
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
    
    func showAlertWithOptions() {
        let alert = UIAlertController(title: LOCALIZED("label_choose_form"),
                                      message: "",
                                      preferredStyle: .alert)
        
        let optionQRcode = UIAlertAction(title: LOCALIZED("label_scan_qrcode"), style: .default) { _ in
            let QRCodeController = QrScannerViewController()
            self.navigationController?.pushViewController(QRCodeController, animated: true)
        }

        let optionMRZ = UIAlertAction(title: LOCALIZED("label_scan_mrz"), style: .default) { _ in
            let MRZController = MRZScannerViewController()
            self.navigationController?.pushViewController(MRZController, animated: true)
        }
        
        let optionCancel = UIAlertAction(title: LOCALIZED("cancel"), style: .cancel)
        
        alert.addAction(optionQRcode)
        alert.addAction(optionMRZ)
        alert.addAction(optionCancel)
        
        present(alert, animated: true, completion: nil)
    }

    // --------------------------------------
    // MARK: Event
    // --------------------------------------
    @IBAction func startButtonAction(_ sender: UIButton) {
        showAlertWithOptions()
    }
}
