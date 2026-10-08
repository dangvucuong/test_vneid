import Foundation

extension Optional where Wrapped == String {
	var isNilOrEmpty: Bool {
		return self?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ?? true
	}
}
