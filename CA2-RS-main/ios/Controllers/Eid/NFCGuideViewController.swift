import UIKit
import Lottie

class NFCGuideViewController: UIViewController {

    @IBOutlet weak var lottieView: LottieAnimationView!
    @IBOutlet weak var confirmButton: UIButton!
    @IBOutlet weak var prepareScanLabel: UILabel!
    @IBOutlet weak var descriptionLabel: UILabel!
    
    var confirmCallBack: (() -> ())?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        prepareScanLabel.text = LOCALIZED("label_prepare_scan")
        descriptionLabel.text = LOCALIZED("label_description_scan")
        confirmButton.setTitle(LOCALIZED("ready").uppercased(), for: .normal)
        lottieView.loopMode = .loop
        lottieView.play()
        confirmButton.layer.cornerRadius = 22
    }
    
    @IBAction func confirmTapped(_ sender: Any) {
        dismiss(animated: true) {
            self.confirmCallBack?()
        }
    }
}
