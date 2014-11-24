require 'gosu'
require 'vector2d'

require_relative 'frame_time'

include Gosu

LEFT  = Vector2d.new(-1.0,  0.0)
RIGHT = Vector2d.new( 1.0,  0.0)
UP    = Vector2d.new( 0.0, -1.0)
DOWN  = Vector2d.new( 0.0,  1.0)
ZERO_VECTOR = Vector2d.new(0.0, 0.0)

class Bounds < Struct.new(:width, :height)
end

def sign(n)
  if n > 0
    1
  elsif n < 0
    -1
  else
    0
  end
end


class Shape < Struct.new(:pos,
                         :type)
end

class Loader < Struct.new(:pos,
                          :vel,
                          :bucket_offset,
                          :desired_bucket_offset,
                          :shape)
  def step(dt)
    self.pos += (vel * dt)
    offset_error = desired_bucket_offset- bucket_offset
    self.bucket_offset += sign(offset_error) * 0.1
  end
end

class World < Struct.new(:loader,
                         :shapes,
                         :bounds)
  def initialize(bounds)
    shapes = (0..3).flat_map do |i|
      [Shape.new(Vector2d.new(1.0 + i * 2, 1.0), :triangle),
       Shape.new(Vector2d.new(1.0 + i * 2, 3.0), :circle),
       Shape.new(Vector2d.new(1.0 + i * 2, 5.0), :square),
       Shape.new(Vector2d.new(1.0 + i * 2, 7.0), :diamond)]
    end.to_a
    # shapes = circles + [ Shape.new(Vector2d.new(1.0, 3.0), :circle), 
    #            Shape.new(Vector2d.new(3.0, 1.0), :circle), 
    #            Shape.new(Vector2d.new(3.0, 3.0), :circle), ]
    super(Loader.new(Vector2d.new(10.0, 10.0),
                     ZERO_VECTOR,
                     0,
                     nil),
          shapes,
          bounds)
  end

  def try_to_pickup_shape
    if loader.shape.nil?
      shapes.detect
    end
  end

  def update(vel, desired_bucket_offset)
    loader.vel = vel
    loader.desired_bucket_offset = desired_bucket_offset
  end

  def step(dt)
    loader.step(dt)
  end
end


DIRECTIONS = { Gosu::KbLeft  => LEFT,
               Gosu::KbRight => RIGHT,
               Gosu::KbUp    => UP,
               Gosu::KbDown  => DOWN }




class Game < Gosu::Window
  attr_reader :images
  def initialize()
    super(480, 480, false)
    @frame_time = FrameTime.new do 
      Time.now
    end

    self.caption = "Shape Loader!" 
    @images = { evoker: Image.new(self, "./gfx/evoker.base.172.png", false),
                 floor: Image.new(self, "./gfx/flagstone.base.111.png", false),
                 circle: Image.new(self, "./gfx/circle.png", false),
                 square: Image.new(self, "./gfx/square.png", false),
                 triangle: Image.new(self, "./gfx/triangle.png", false),
                 diamond: Image.new(self, "./gfx/diamond.png", false), }
    @our_id = nil
    @world = World.new(Bounds.new(15, 15))
    @desired_bucket_offset = 0.0

    @last_player_vel = ZERO_VECTOR
  end

  def needs_cursor?
    return true
  end

  def update
    commanded_directions = DIRECTIONS.select{ |key, value| self.button_down? key }.values
    player_vel = commanded_directions.inject(ZERO_VECTOR) { |sum, x| sum + x }
    @world.update(player_vel * 3.0, @desired_bucket_offset)
    @world.step(@frame_time.dt)

    # todo ignore sending events with the same velocity
    # player_vel = commanded_directions.inject(ZERO_VECTOR) { |sum, x| sum + x }
    # if player_vel != @last_player_vel
    #   @connection.send_event(Marshal.dump(player_vel * 5.0))
    # end
    # @last_player_vel = player_vel
  end

  def draw_bucket(loader)
    bucket_offset = Vector2d.new(-1.0, -0.2 + loader.bucket_offset)
    pos = bucket_offset + loader.pos
    images[:circle].draw(pos.x * 32, pos.y * 32, 1)
  end

  def draw_shape(shape)
    images[shape.type].draw(shape.pos.x * 32, shape.pos.y * 32, 1)
  end


  
  def draw
    @world.bounds.width.times do |x|
      @world.bounds.height.times do |y|
        images[:floor].draw(x * 32, y * 32, 0)
      end
    end

    pos = @world.loader.pos
    images[:evoker].draw(pos.x * 32, pos.y * 32, 1)

    @world.shapes.each do |shape|
      draw_shape(shape)
    end

    draw_bucket(@world.loader)


    
  #   @world.players.values.each do |p|
  #     images[:evoker].draw((p.pos.x * 32).round, (p.pos.y * 32).round, 1)
  #   end
  end

  def quit
    close
  end

  def button_down(id)
    if id == Gosu::KbSpace then
      # if @desired_bucket_offset != -1.0
      #   @desired_bucket_offset = -1.0
      # else
      #   @desired_bucket_offset = 0.0
      # end


      
    end
    if id == Gosu::KbEscape then
      quit
    end
  end
end

g = Game.new()
g.show
