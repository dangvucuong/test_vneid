import UIKit

class NavigationController: UINavigationController {

    // --------------------------------------
    // MARK: Life Cycle
    // --------------------------------------

    override func viewDidLoad() {
        super.viewDidLoad()
    }

    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }
}
