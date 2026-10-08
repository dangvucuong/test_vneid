//
//  TransferConfirmViewController.swift
//  xverifydemoapp
//
//  Created by Huynh Minh Hieu on 16/03/2024.
//

import UIKit

class TransferConfirmViewController: ChildViewController {

    @IBOutlet weak var senderInfomationLbl: UILabel!
    @IBOutlet weak var sourceAccountLbl: UILabel!
    @IBOutlet weak var availableBalanceLbl: UILabel!
    @IBOutlet weak var beneficiaryInfomationLbl: UILabel!
    @IBOutlet weak var beneficiaryNameLbl: UILabel!
    @IBOutlet weak var transactionInfomationLbl: UILabel!
    
    var transferType: TransferType = .TypeC
    
    @IBOutlet weak var btnTitleMoney: UIButton!
    @IBOutlet weak var continueButton: UIButton!
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }

    override func setupUI() {
        setLogoImage(UIImage(named: "ic_header_logo"))
        senderInfomationLbl.text = LOCALIZED("sender_information")
        sourceAccountLbl.text = LOCALIZED("source_account")
        availableBalanceLbl.text = LOCALIZED("available_balance")
        beneficiaryInfomationLbl.text = LOCALIZED("beneficiary_information")
        beneficiaryNameLbl.text = LOCALIZED("beneficiary_name")
        transactionInfomationLbl.text = LOCALIZED("transaction_information")
        continueButton.setTitle(LOCALIZED("next_button").uppercased(), for: .normal)
        continueButton.layer.cornerRadius = continueButton.frame.height/2
        
        let money = transferType == .TypeC ? "500,000 VND" : "50,000,000 VND"
        
        btnTitleMoney.setTitle(money, for: .normal)
    }
    
    @IBAction func continueButtonAction(_ sender: Any) {
        let controller = INIT_CONTROLLER_XIB(CaptureFrontFaceViewController.self)
        controller.transferType = self.transferType
        self.navigationController?.pushViewController(controller, animated: true)
    }
    
}
