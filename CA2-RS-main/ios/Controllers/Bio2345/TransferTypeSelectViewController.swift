//
//  TransferTypeSelectViewController.swift
//  xverifydemoapp
//
//  Created by Huynh Minh Hieu on 07/05/2024.
//

import UIKit

class TransferTypeSelectViewController: NavigationBarViewController {
    @IBOutlet weak var transferTypeCButton: UIButton!
    @IBOutlet weak var transferTypeDButton: UIButton!
    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    
    override func setupUI() {
        setLogoImage(UIImage(named: "ic_header_logo"))
        transferTypeCButton.layer.cornerRadius = transferTypeCButton.frame.height/2
        transferTypeDButton.layer.cornerRadius = transferTypeDButton.frame.height/2
        
        transferTypeCButton.setTitle(LOCALIZED("transfer_type_c"), for: .normal)
        transferTypeCButton.titleLabel?.font = UIFont(name: "GoogleSans-Medium", size: 14)
        transferTypeCButton.titleLabel?.textAlignment = .center
        
        transferTypeDButton.setTitle(LOCALIZED("transfer_type_d"), for: .normal)
        transferTypeDButton.titleLabel?.font = UIFont(name: "GoogleSans-Medium", size: 14)
        transferTypeDButton.titleLabel?.textAlignment = .center
        
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
            navigationController.popToRootViewController(animated: true)
        }
    }
    
    @IBAction func typeCDidPress(_ sender: Any) {
        let controller = INIT_CONTROLLER_XIB(TransferConfirmViewController.self)
        controller.transferType = .TypeC
        self.navigationController?.pushViewController(controller, animated: true)
    }
    
    @IBAction func typeDDidPress(_ sender: Any) {
        let controller = INIT_CONTROLLER_XIB(TransferConfirmViewController.self)
        controller.transferType = .TypeD
        self.navigationController?.pushViewController(controller, animated: true)
    }
}
