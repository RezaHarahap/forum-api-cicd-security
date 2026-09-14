import NewThread from '../../Domains/threads/entities/NewThread.js';

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(payload, owner) {
    const newThread = new NewThread(payload);
    return this._threadRepository.addThread(newThread, owner);
  }
}

export default AddThreadUseCase;
