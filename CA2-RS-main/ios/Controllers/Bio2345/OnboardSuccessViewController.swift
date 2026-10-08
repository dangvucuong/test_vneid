//
//  OnboardSuccessViewController.swift
//  xverifydemoapp
//
//  Created by Huynh Minh Hieu on 07/05/2024.
//

import UIKit
import xverifysdk

class OnboardSuccessViewController: NavigationBarViewController {

    @IBOutlet weak var label: UILabel!
    @IBOutlet weak var backToPageBtn: UIButton!
    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    override func setupUI() {
        super.setupUI()
        backToPageBtn.layer.cornerRadius = backToPageBtn.frame.height/2
        label.text = LOCALIZED("onboard_success")
        label.font = UIFont(name: "GoogleSans-Bold", size: 18)
        setupLeftNavigationBarItem()
        setLogoImage(UIImage(named: "ic_header_logo"))
        backToPageBtn.setTitle(LOCALIZED("home_page_button").uppercased(), for: .normal)
        backToPageBtn.titleLabel?.font = UIFont(name: "GoogleSans-Medium", size: 16.0)
    }
    
    private func setupLeftNavigationBarItem() {
        let button = CustomButton.init(CGRect(x: 0, y: 0, width: 0, height: 0))
        button.backgroundColor = .clear
        button.tintColor = .clear
        navigationItem.leftBarButtonItem = UIBarButtonItem(customView: button)
    }
    
    @IBAction func backToPageDidPress(_ sender: Any) {
        if let navigationController = self.navigationController {
            navigationController.popToRootViewController(animated: true)
        }
    }
    
}
