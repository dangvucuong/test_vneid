//
//  PassiveEkycViewController.swift
//  xverifydemoapp
//
//  Created by Huynh Minh Hieu on 05/06/2024.
//

import UIKit
import AVFoundation
import xverifysdk
import CoreVideo
import Lottie
import SwiftyJSON

class PassiveEkycViewController: NavigationBarViewController {
    @IBOutlet weak private var cameraView: UIView!
    @IBOutlet weak var animationScan: LottieAnimationView!
    @IBOutlet weak var animationLoading: LottieAnimationView!
    @IBOutlet weak var stepInstructionLabel: UILabel!
    
    private var previewLayer: AVCaptureVideoPreviewLayer!
    private lazy var captureSession = AVCaptureSession()
    private lazy var sessionQueue = DispatchQueue(label: Constant.sessionQueueLabel)
    private var lastFrame: CMSampleBuffer?
    public var eidVerified: Bool = false
    public var eidSignatureVerified: Bool = false
    

    
    private var prefixInstruction = ""
    var player: AVAudioPlayer?
    
    private lazy var previewOverlayView: UIImageView = {
        precondition(isViewLoaded)
        let previewOverlayView = UIImageView(frame: .zero)
        previewOverlayView.contentMode = UIView.ContentMode.scaleAspectFill
        previewOverlayView.translatesAutoresizingMaskIntoConstraints = false
        return previewOverlayView
    }()
    
    private lazy var annotationOverlayView: UIView = {
        precondition(isViewLoaded)
        let annotationOverlayView = UIView(frame: .zero)
        annotationOverlayView.translatesAutoresizingMaskIntoConstraints = false
        return annotationOverlayView
    }()
    
    // MARK: - UIViewController
    override func viewDidLoad() {
        super.viewDidLoad()
        //self.navigationItem.title = LOCALIZED("step_3_face_detect")
        setLogoImage(UIImage(named: "ic_header_logo"))
        animationScan.loopMode = .loop
        animationScan.play()
        
        animationLoading.isHidden = true
        let fillKeypath = AnimationKeypath(keypath: "**.Fill 1.Color")
        let redValueProvider = ColorValueProvider(LottieColor(r: 0.6, g: 0.6, b: 0.6, a: 1))
        animationLoading.setValueProvider(redValueProvider, keypath: fillKeypath)
        animationLoading.loopMode = .loop
        
        stepInstructionLabel.text = LOCALIZED("put_your_face_in_the_frame").uppercased()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        startSession()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
    }
    
    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        stopSession()
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
    }
    
    // --------------------------------------
    // MARK: Overried
    // --------------------------------------
    override func setupUI() {
        AVCaptureDevice.requestAccess(for: AVMediaType.video, completionHandler: { success in
            if success == false {
                DISPATCH_ASYNC_MAIN {
                    self.setupLayerView()
                }
                return
            }
            DISPATCH_ASYNC_MAIN {
                self.previewLayer = AVCaptureVideoPreviewLayer(session: self.captureSession)
                self.previewLayer.videoGravity = AVLayerVideoGravity.resizeAspectFill
                self.previewLayer.frame = self.cameraView.frame
                self.previewLayer.cornerRadius = self.cameraView.frame.height / 2
                
                self.setUpPreviewOverlayView()
                self.setUpAnnotationOverlayView()
                self.setUpCaptureSessionOutput()
                self.setUpCaptureSessionInput()
                self.setupLayerView()
            }
        })
        
        PASSIVESERVICE.initialize(referenceImagePath: ONBOARDDATAMANAGER.eidFacePath, verificationMode: .verify_liveness_face_matching, passiveLivenessDelegate: self)    }
    
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
    
    
    private func navigateToResultView(verifyFaceMatch: Bool, capturedFacePath: String?) {
        animationLoading.isHidden = false
        animationLoading.play()
        stepInstructionLabel.text = LOCALIZED("please_wait_verifying").uppercased()
        PASSIVESERVICE.clearSession()
        if let eid = ONBOARDDATAMANAGER.eid {
            DISPATCH_ASYNC_MAIN_AFTER(1) { [weak self] in
                guard let self = self else { return }
                self.navigateToEkycResultView(isValidIdCard: self.eidVerified, verifyFaceMatch: verifyFaceMatch, capturedFacePath: capturedFacePath ?? "")
            }
        }
    }
    
    private func navigateToEkycResultView(isValidIdCard: Bool, verifyFaceMatch: Bool, capturedFacePath: String) {
        DISPATCH_ASYNC_MAIN {
            let controller = INIT_CONTROLLER_XIB(VerifyEkycResultViewController.self)
            controller.isValidIdCard = isValidIdCard
            controller.verifyFaceMatch = verifyFaceMatch
            controller.capturedFacePath = capturedFacePath
            controller.modalPresentationStyle = .fullScreen
            self.present(controller, animated: true, completion: nil)
        }
    }
    
    private func playSound() {
        guard let path = Bundle.main.path(forResource: "sound_beep", ofType:"wav") else {return}
        let url = URL(fileURLWithPath: path)
        do {
            player = try AVAudioPlayer(contentsOf: url)
            player?.play()
        } catch let error {
            print(error.localizedDescription)
        }
    }
    // --------------------------------------
    // MARK: Private
    // --------------------------------------
    private func setupLayerView() {
        cameraView.layer.cornerRadius = cameraView.frame.height / 2.0
        cameraView.layer.borderWidth = 6
        cameraView.layer.borderColor = ColorBrand.appColorWhite.cgColor
        cameraView.clipsToBounds = true
    }
    
    private func setUpCaptureSessionOutput() {
        weak var weakSelf = self
        sessionQueue.async {
            guard let strongSelf = weakSelf else {
                print("Self is nil!")
                return
            }
            strongSelf.captureSession.beginConfiguration()
            strongSelf.captureSession.sessionPreset = AVCaptureSession.Preset.medium
            
            let output = AVCaptureVideoDataOutput()
            output.videoSettings = [(kCVPixelBufferPixelFormatTypeKey as String): kCVPixelFormatType_32BGRA]
            output.alwaysDiscardsLateVideoFrames = true
            let outputQueue = DispatchQueue(label: Constant.videoDataOutputQueueLabel)
            output.setSampleBufferDelegate(strongSelf, queue: outputQueue)
            guard strongSelf.captureSession.canAddOutput(output) else {
                print("Failed to add capture session output.")
                return
            }
            strongSelf.captureSession.addOutput(output)
            strongSelf.captureSession.commitConfiguration()
        }
    }
    
    private func setUpCaptureSessionInput() {
        weak var weakSelf = self
        sessionQueue.async {
            guard let strongSelf = weakSelf else {
                print("Self is nil!")
                return
            }
            let cameraPosition: AVCaptureDevice.Position = .front
            guard let device = strongSelf.captureDevice(forPosition: cameraPosition) else {
                print("Failed to get capture device for camera position: \(cameraPosition)")
                return
            }
            do {
                strongSelf.captureSession.beginConfiguration()
                let currentInputs = strongSelf.captureSession.inputs
                for input in currentInputs {
                    strongSelf.captureSession.removeInput(input)
                }
                
                let input = try AVCaptureDeviceInput(device: device)
                guard strongSelf.captureSession.canAddInput(input) else {
                    print("Failed to add capture session input.")
                    return
                }
                strongSelf.captureSession.addInput(input)
                strongSelf.captureSession.commitConfiguration()
            } catch {
                print("Failed to create capture device input: \(error.localizedDescription)")
            }
        }
    }
    
    private func startSession() {
        weak var weakSelf = self
        sessionQueue.async {
            guard let strongSelf = weakSelf else {
                print("Self is nil!")
                return
            }
            strongSelf.captureSession.startRunning()
        }
    }
    
    private func stopSession() {
        weak var weakSelf = self
        sessionQueue.async {
            guard let strongSelf = weakSelf else {
                print("Self is nil!")
                return
            }
            strongSelf.captureSession.stopRunning()
        }
    }
    
    private func setUpPreviewOverlayView() {
        cameraView.addSubview(previewOverlayView)
        NSLayoutConstraint.activate([
            previewOverlayView.centerXAnchor.constraint(equalTo: cameraView.centerXAnchor),
            previewOverlayView.centerYAnchor.constraint(equalTo: cameraView.centerYAnchor),
            previewOverlayView.leadingAnchor.constraint(equalTo: cameraView.leadingAnchor),
            previewOverlayView.trailingAnchor.constraint(equalTo: cameraView.trailingAnchor),
            
        ])
    }
    
    private func setUpAnnotationOverlayView() {
        cameraView.addSubview(annotationOverlayView)
        NSLayoutConstraint.activate([
            annotationOverlayView.topAnchor.constraint(equalTo: cameraView.topAnchor),
            annotationOverlayView.leadingAnchor.constraint(equalTo: cameraView.leadingAnchor),
            annotationOverlayView.trailingAnchor.constraint(equalTo: cameraView.trailingAnchor),
            annotationOverlayView.bottomAnchor.constraint(equalTo: cameraView.bottomAnchor),
        ])
    }
    
    private func captureDevice(forPosition position: AVCaptureDevice.Position) -> AVCaptureDevice? {
        if #available(iOS 10.0, *) {
            let discoverySession = AVCaptureDevice.DiscoverySession (
                deviceTypes: [.builtInWideAngleCamera],
                mediaType: .video,
                position: .unspecified
            )
            return discoverySession.devices.first { $0.position == position }
        }
        return nil
    }
    
    private func removeDetectionAnnotations() {
        for annotationView in annotationOverlayView.subviews {
            annotationView.removeFromSuperview()
        }
    }
    
    private func updatePreviewOverlayViewWithLastFrame() {
        guard let lastFrame = lastFrame,
              let imageBuffer = CMSampleBufferGetImageBuffer(lastFrame)
        else {
            return
        }
        self.updatePreviewOverlayViewWithImageBuffer(imageBuffer)
        self.removeDetectionAnnotations()
    }
    
    func rotateImage(image: UIImage) -> UIImage {
        if (image.imageOrientation == UIImage.Orientation.up) {
            return image
        }
        UIGraphicsBeginImageContext(image.size)
        image.draw(in: CGRect(origin: .zero, size: image.size))
        let copy = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        
        return copy!
    }
    
    private func updatePreviewOverlayViewWithImageBuffer(_ imageBuffer: CVImageBuffer?) {
        guard let imageBuffer = imageBuffer else {
            return
        }
        let orientation: UIImage.Orientation = .leftMirrored
        if let image = createUIImage(from: imageBuffer, orientation: orientation) {
            previewOverlayView.image = rotateImage(image: image)
        }
    }
    
    private func createUIImage(from imageBuffer: CVImageBuffer, orientation: UIImage.Orientation) -> UIImage? {
        let ciImage = CIImage(cvPixelBuffer: imageBuffer)
        let context = CIContext(options: nil)
        guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent) else { return nil }
        return UIImage(cgImage: cgImage, scale: 1.0, orientation: orientation)
    }
    
    private func requestBioFaceVerification(idCard:String, captureImage: UIImage) {
        BIOFACADE.requestBioFaceVerification(idCard: idCard, deviceUUID: Utils.sampleDeviceUUID, captureImage: captureImage) { result in
            
            if let onboardingState = result.onboardingState {
                ONBOARDDATAMANAGER.onboardStatus = onboardingState
            }
            
            if let match = result.isMatching, match {
                self.navigateToTransferConfirmView()
            }
            
        } onError: { error in
            Log.error(error.localizedDescription)
        }
        
    }
    
    private func navigateToOTPConfirmView() {
        let controller = OTPConfirmViewController()
        self.navigationController?.pushViewController(controller, animated: true)
    }
    
    
    private func navigateToTransferConfirmView() {
        let controller = TransferConfirmViewController()
        self.navigationController?.pushViewController(controller, animated: true)
    }
}

// --------------------------------------
// MARK: AVCaptureVideoDataOutputSampleBufferDelegate
// --------------------------------------
@available(iOS 14.0, *)
extension PassiveEkycViewController: AVCaptureVideoDataOutputSampleBufferDelegate {
    func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
        guard let imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
            print("Failed to get image buffer from sample buffer.")
            return
        }
        lastFrame = sampleBuffer
        let imageWidth = CGFloat(CVPixelBufferGetWidth(imageBuffer))
        let imageHeight = CGFloat(CVPixelBufferGetHeight(imageBuffer))
        
        DISPATCH_ASYNC_MAIN {
            self.updatePreviewOverlayViewWithLastFrame()
        }
        PASSIVESERVICE.startPassiveLiveness(sampleBuffer: sampleBuffer, width: imageWidth, height: imageHeight)
    }
}

// --------------------------------------
// MARK: EkycLivenessDelegate
// --------------------------------------

extension PassiveEkycViewController: PassiveLivenessDelegate {
    func onStatus(message: String) {
        stepInstructionLabel.text = message
    }
    
    func onResultImage(path: String?) {
        stopSession()
        self.navigateToResultView(verifyFaceMatch: true, capturedFacePath: path ?? "")
    }
    
    func noFace() {
        self.stepInstructionLabel.text = LOCALIZED("face_verify_transaction").uppercased()
    }
    
    func isFaceSoFar() {
        self.stepInstructionLabel.text = LOCALIZED("passive_is_far").uppercased()
    }
    
    func isFaceSoNear() {
        self.stepInstructionLabel.text = LOCALIZED("passive_is_near").uppercased()
    }
    
    func isDetectedFace() {
        self.stepInstructionLabel.text = LOCALIZED("passive_is_detect").uppercased()
    }
}

