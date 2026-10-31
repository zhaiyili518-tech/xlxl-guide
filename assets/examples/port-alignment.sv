module wx1860_ports(
output o_WX1860_RST_N,
input i_LAN1_LINK_ACT_N,
input i_LAN2_LINK_ACT_N
);
endmodule

package port_types;
    typedef logic [31:0] payload_t;
endpackage

module mixed_ports(
output reg [15:0] o_FM_VALUE,
input i_START,
// LAN
input wire [1:0] i_LAN_VALUE,
input wire i_RESET_N
);
endmodule

module edge_ports(
input i_clk,
output port_types::payload_t o_payload,
`ifdef EXTRA_LANE
output wire signed [1023:12] o_extra_lane,
`else
output reg [7:0] o_spare_lane,
`endif
input logic [0:1][15:0] i_matrix [0:3],
input wire [7:0] i_lane, i_lane_backup,
output \port.with.dots ,
input i_reset_n
);
endmodule
