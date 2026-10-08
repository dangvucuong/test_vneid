import Foundation
import MediaPlayer
import PanModal
import UIKit

extension UIViewController {
    
    func presentAsPanModal(controller: UIViewController) {
        controller.modalPresentationStyle = .custom
        controller.modalPresentationCapturesStatusBarAppearance = true
        controller.transitioningDelegate = PanModalPresentationDelegate.default
        
        guard let presentedController = self.presentedViewController else {
            present(controller, animated: true, completion: nil)
            return
        }
        presentedController.present(controller, animated: true, completion: nil)
    }
}
