//
//  DigitalSignaturesViewController.swift
//  xverifydemoapp
//
//  Created by Minh Tri on 14/11/2023.
//

import UIKit
import PDFKit

class SignContractViewController: NavigationBarViewController {

    @IBOutlet var pdfView: PDFView!
    @IBOutlet weak var doneButton: UIButton!
    
    // --------------------------------------
    // MARK: Life Cycle
    // --------------------------------------
    override func viewDidLoad() {
        super.viewDidLoad()
        if #available(iOS 16.0, *) {
            self.navigationItem.leftBarButtonItem?.isHidden = true
        } else {
            // Fallback on earlier versions
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
    }
    
    override var leftBarButton: UIButton? {
        return nil
    }
    
    // --------------------------------------
    // MARK: Override
    // --------------------------------------
    override func setupUI() {
        super.setupUI()
        setLogoImage(UIImage(named: "ic_header_logo"))
        loadPDFFile()
        doneButton.layer.cornerRadius = self.doneButton.frame.height / 2
    }
    
    private func loadPDFFile() {
        if let path = Bundle.main.path(forResource: "contract_sample", ofType: "pdf") {
            if let pdfDocument = PDFDocument(url: URL(fileURLWithPath: path)) {
                pdfView.displayMode = .singlePageContinuous
                pdfView.autoScales = true
                pdfView.displayDirection = .vertical
                pdfView.document = pdfDocument
            }
        }
    }
    // --------------------------------------
    // MARK: Event
    // --------------------------------------
    @IBAction func doneButtonAction(_ sender: UIButton) {
        ONBOARDDATAMANAGER.clear()
            APPDELEGATE.setupRootController(INIT_CONTROLLER_XIB(PreviewContractViewController.self), false)
    }
}
