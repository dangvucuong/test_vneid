
import UIKit

class ImageTableCell: UITableViewCell {

    @IBOutlet weak var _imgView: UIImageView!
    
    // --------------------------------------
    // MARK: Class
    // --------------------------------------
    
    static var height : CGFloat {
        return 320.0
    }

    // --------------------------------------
    // MARK: Life Cycle
    // --------------------------------------

    override public func awakeFromNib() {
        super.awakeFromNib()
        _imgView.layer.cornerRadius = 10.0
        _imgView.layer.masksToBounds = true
    }

    // --------------------------------------
    // MARK: Public
    // --------------------------------------

    func setup(image: UIImage?) {
        _imgView.image = image
        _imgView.contentMode = .scaleAspectFill
    }
    
}
