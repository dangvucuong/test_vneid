import UIKit

class ChildViewController: NavigationBarViewController {

    // --------------------------------------
    // MARK: Overrides
    // --------------------------------------

    override var leftBarButton: UIButton? {
        let backButton = UIButton(frame: CGRect(x: 0.0, y: 0.0, width: kBarButtonDefaultWidth, height: kBarButtonDefaultHeight))
        backButton.setImage(UIImage(named: "ic_action_arrowback"), for: .normal)
        return backButton
    }

    override func handleLeftBarButtonEvent() {
        if let navigation = navigationController {
            navigation.popViewController(animated: true)
        } else {
            dismiss(animated: true, completion: nil)
        }
    }
}
