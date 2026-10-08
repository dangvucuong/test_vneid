//
//  VerifyEkybMainViewController.swift
//  xverifydemoapp
//
//  Created by Nguyễn Hiếu on 14/2/25.
//

import UIKit

class VerifyEkybMainViewController: NavigationBarViewController {

    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var introDescription: UILabel!
    @IBOutlet weak var startButton: UIButton!
    
    // --------------------------------------
    // MARK: Life Cycle
    // --------------------------------------
    override func viewDidLoad() {
        super.viewDidLoad()
        startButton.setTitle(LOCALIZED("start_button").uppercased(), for: .normal)
        setLogoImage(UIImage(named: "ic_header_logo"))
    }


    // --------------------------------------
    // MARK: Overried
    // --------------------------------------
    override func setupUI() {
        titleLabel.text = LOCALIZED("intro_title_ekyb")
        introDescription.text = LOCALIZED("intro_description_ekyc")
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

    // --------------------------------------
    // MARK: Event
    // --------------------------------------
    @IBAction func startButtonAction(_ sender: UIButton) {
        let vc = EkybUploadDocumentViewController()
        navigationController?.pushViewController(vc, animated: true)
    }
}
