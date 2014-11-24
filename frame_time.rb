



class FrameTime
  def initialize(&blk)
    @t_blk = blk
    @last_time = @t_blk.call
  end

  def dt
    current_time = @t_blk.call
    delta_time = current_time - @last_time
    @last_time = current_time
    return delta_time
  end
end
