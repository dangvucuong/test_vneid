//
//  OCRCaptureViewController.swift
//  xverifydemoapp
//
//  Created by Huynh Minh Hieu on 20/03/2024.
//

import UIKit
import AVFoundation

private enum CaptureStep {
    case front
    case back
}

class OCRCaptureViewController: ChildViewController {
    
    //UI components
    @IBOutlet weak var cameraView: UIView!
    @IBOutlet weak var captureButton: UIButton!
    @IBOutlet weak var stepInstructionLabel: UILabel!
    
    private var captureStep: CaptureStep = .front {
        didSet {
            switch captureStep {
            case .front:
                setupInstructionLabel(content: LOCALIZED("ocr_capture_front"))
            case .back:
                setupInstructionLabel(content: LOCALIZED("ocr_capture_back"))
            }
        }
    }
    var videoPreviewLayer: AVCaptureVideoPreviewLayer!
    var imageOutput: AVCapturePhotoOutput!
    private lazy var sessionQueue = DispatchQueue(label: Constant.sessionQueueLabel)
    var captureSession: AVCaptureSession = AVCaptureSession()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setLogoImage(UIImage(named: "ic_header_logo"))
        setupInstructionLabel(content: LOCALIZED("ocr_capture_front"))
        captureButton.setTitle(LOCALIZED("take_photo").uppercased(), for: .normal)
        captureSession.sessionPreset = AVCaptureSession.Preset.high
        imageOutput = AVCapturePhotoOutput()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        setUpCameraView()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        stopCaptureSession()
    }
    
    override func setupUI() {
        super.setupUI()
        captureButton.layer.cornerRadius = captureButton.frame.height/2
        cameraView.layer.cornerRadius = kCornerRadius
        cameraView.layer.masksToBounds = true
    }
    
    private func setupInstructionLabel(content: String) {
        DISPATCH_ASYNC_MAIN { [weak self] in
            guard let self = self else {return}
            self.stepInstructionLabel.text = content
        }
    }
    
    private func setUpCameraView() {
        guard let backCamera = AVCaptureDevice.default(for: AVMediaType.video)
            else {
                print("Unable to access back camera!")
                return
        }

        do {
            let input = try AVCaptureDeviceInput(device: backCamera)
            
            if captureSession.canAddInput(input) && captureSession.canAddOutput(imageOutput)  {
                captureSession.addInput(input)
                captureSession.addOutput(imageOutput)
                setupLivePreview()
                DISPATCH_ASYNC_BG { [weak self] in
                    guard let self = self else {return}
                    self.captureSession.startRunning()
                    
                    DISPATCH_ASYNC_MAIN {
                        if self.videoPreviewLayer != nil {
                            self.videoPreviewLayer.frame = self.cameraView.bounds
                        }
                    }
                }
            }
        }
        catch let error  {
            print("Error Unable to initialize back camera:  \(error.localizedDescription)")
        }
        
    }
    
    private func setupLivePreview() {
        videoPreviewLayer = AVCaptureVideoPreviewLayer(session: captureSession)
        
        videoPreviewLayer.videoGravity = .resizeAspectFill
        videoPreviewLayer.connection?.videoOrientation = .portrait
        cameraView.layer.addSublayer(videoPreviewLayer)
    }
    
    private func navigateToOCRLoadingRequestView() {
        let controller = INIT_CONTROLLER_XIB(OCRLoadingViewController.self)
        self.navigationController?.pushViewController(controller, animated: true)
    }
    
    private func stopCaptureSession() {
        self.captureStep = .front
        self.captureSession.stopRunning()
        self.videoPreviewLayer.removeFromSuperlayer()
        self.videoPreviewLayer = nil
        if let input = captureSession.inputs.first, let output = captureSession.outputs.first {
            self.captureSession.removeInput(input)
            self.captureSession.removeOutput(output)
        }
    }
   
    @IBAction func captureButtonAction(_ sender: Any) {
        let settings = AVCapturePhotoSettings(format: [AVVideoCodecKey: AVVideoCodecType.jpeg])
        imageOutput.capturePhoto(with: settings, delegate: self)
        self.videoPreviewLayer.connection?.isEnabled = false
    }
}

extension OCRCaptureViewController: AVCapturePhotoCaptureDelegate {
    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        guard let imageData = photo.fileDataRepresentation()
                else { return }
            
        let image = UIImage(data: imageData)
        switch captureStep {
        case .front:
           let frontName = "FRONT_\(Date().millisecondsSince1970).jpeg"
            guard let image = image else { return }
            ONBOARDDATAMANAGER.cardFrontPath = saveFileToLocal(image, fileName: frontName).absoluteString
            captureStep = .back
            
            if let videoLayerConnection = self.videoPreviewLayer.connection {
                videoLayerConnection.isEnabled = true
            }
        case .back:
            let backName = "BACK_\(Date().millisecondsSince1970).jpeg"
            guard let image = image else { return }
            ONBOARDDATAMANAGER.cardBackPath = saveFileToLocal(image, fileName: backName).absoluteString
            navigateToOCRLoadingRequestView()
        }
        
    }
}

extension OCRCaptureViewController {
    
     func saveFileToLocal(_ image: UIImage, fileName: String) -> URL {
        let directoryPath =  try! FileManager().url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        let urlString: NSURL = directoryPath.appendingPathComponent(fileName) as NSURL
        print("Image path : \(urlString)")
        if !FileManager.default.fileExists(atPath: urlString.path!) {
            do {
                try image.jpegData(compressionQuality: 1.0)!.write(to: urlString as URL)
                    print ("Image Added Successfully")
            } catch {
                    print ("Image Not added")
            }
        }
        return urlString as URL
    }
}

