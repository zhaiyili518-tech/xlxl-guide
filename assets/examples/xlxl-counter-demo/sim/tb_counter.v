`timescale 1ns/1ps

module tb_counter;
    localparam WIDTH = 8;

    reg clk = 1'b0;
    reg rst_n = 1'b1;
    reg enable = 1'b0;
    wire [WIDTH-1:0] count;
    integer i;

    counter #(.WIDTH(WIDTH)) dut (
        .clk(clk),
        .rst_n(rst_n),
        .enable(enable),
        .count(count)
    );

    always #5 clk = ~clk;

    task check_count;
        input [WIDTH-1:0] expected;
        input [255:0] stage;
        begin
            if (count !== expected) begin
                $display("FAIL [%0s] at %0t: expected=%0d actual=%0d",
                         stage, $time, expected, count);
                $fatal(1, "Counter self-check failed");
            end
        end
    endtask

    initial begin
        $dumpfile("wave.vcd");
        $dumpvars(0, tb_counter);

        #1;
        rst_n = 1'b0;
        #1;
        check_count(0, "initial reset");
        repeat (2) @(negedge clk);
        rst_n = 1'b1;
        enable = 1'b1;

        for (i = 1; i <= 5; i = i + 1) begin
            @(posedge clk);
            #1;
            check_count(i, "enabled increment");
        end

        @(negedge clk);
        enable = 1'b0;
        repeat (3) begin
            @(posedge clk);
            #1;
            check_count(5, "pause holds count");
        end

        @(negedge clk);
        enable = 1'b1;
        @(posedge clk);
        #1;
        check_count(6, "resume increment");

        for (i = 1; i <= 250; i = i + 1) begin
            @(posedge clk);
            #1;
            check_count((6 + i) % 256, "increment and wraparound");
        end

        @(posedge clk);
        #1;
        check_count(1, "after wraparound");
        #2;
        rst_n = 1'b0;
        #1;
        check_count(0, "asynchronous reset");

        @(negedge clk);
        enable = 1'b0;
        rst_n = 1'b1;
        repeat (2) begin
            @(posedge clk);
            #1;
            check_count(0, "disabled after reset");
        end

        $display("PASS: reset, count, pause, resume and wraparound");
        $finish;
    end

    initial begin
        #10000;
        $fatal(1, "Timeout: testbench did not finish");
    end
endmodule