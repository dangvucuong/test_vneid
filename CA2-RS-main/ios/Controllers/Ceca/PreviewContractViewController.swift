//
//  PreviewContractViewController.swift
//  xverifydemoapp
//
//  Created by Minh Tri on 14/11/2023.
//

import UIKit
import PDFKit

class PreviewContractViewController: NavigationBarViewController {

    @IBOutlet var pdfView: PDFView!
    @IBOutlet weak var verifyButton: UIButton!
    
    // --------------------------------------
    // MARK: Life Cycle
    // --------------------------------------
    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
    }
    
    // --------------------------------------
    // MARK: Override
    // --------------------------------------
    override func setupUI() {
        super.setupUI()
        setLogoImage(UIImage(named: "ic_header_logo"))
        loadPDFFile()
        verifyButton.layer.cornerRadius = self.verifyButton.frame.height / 2
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
    @IBAction func verifyButtonAction(_ sender: UIButton) {
        let controller = QrScannerViewController.init(nibName: "QrScannerViewController", bundle: nil)
        self.navigationController?.pushViewController(controller, animated: true)
    }
}
