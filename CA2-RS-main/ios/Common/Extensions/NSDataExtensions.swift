import Foundation

extension NSData {
	func castToCPointer<T>() -> T {
		let mem = UnsafeMutablePointer<T>.allocate(capacity: MemoryLayout<T.Type>.size)
		getBytes(mem, length: MemoryLayout<T.Type>.size)
		return mem.move()
	}
}
